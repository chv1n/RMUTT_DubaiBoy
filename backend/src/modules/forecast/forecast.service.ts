import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { spawn } from "child_process";
import { Between, Repository, LessThan } from "typeorm";
import { ProductPlan } from "../product-plan/entities/product-plan.entity";
import { Status } from 'src/common/enums/status.enum';
import * as fs from "fs";
import * as json from "json";
import * as sys from "sys";
import { Product } from '../product/entities/product.entity';
import * as path from "path";
import { MaterialMaster } from '../material/entities/material-master.entity';
import { InventoryTransaction } from '../inventory-transaction/entities/inventory-transaction.entity';
import { MaterialInventory } from '../material-inventory/entities/material-inventory.entity';

@Injectable()
export class ForecastService {

  constructor(
    @InjectRepository(ProductPlan) private productPlanRepository: Repository<ProductPlan>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(MaterialMaster) private materialRepository: Repository<MaterialMaster>,
    @InjectRepository(InventoryTransaction) private transactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(MaterialInventory) private inventoryRepository: Repository<MaterialInventory>,
  ) { }

  async predictMaterialUsage(materialId: number, days: number, targetDate: string) {
    const material = await this.materialRepository.findOne({ where: { material_id: materialId } });
    if (!material) throw new NotFoundException('Material not found');

    // Fetch historical usage (outbound transactions)
    // Transaction -> MaterialInventory -> Material
    const history = await this.transactionRepository.find({
      where: {
        materialInventory: { material: { material_id: materialId } },
        quantity_change: LessThan(0) // Outbound usually negative
      },
      relations: ['materialInventory', 'materialInventory.material'],
      order: { transaction_date: 'ASC' }
    });

    const processedHistory = history.map(h => ({
      Date: h.transaction_date,
      Quantity: Math.abs(h.quantity_change)
    }));

    // If no history, return mock/fallback
    let predictions: number[] = [];
    let confidence = 0;

    if (processedHistory.length > 5) {
      const pythonOutput: any = await this.runModelGeneric(processedHistory, days);
      predictions = pythonOutput?.predictions || [];
      confidence = pythonOutput?.confidence || 0.8;
    } else {
      // Mock prediction if insufficient data
      const avg = processedHistory.reduce((sum, h) => sum + h.Quantity, 0) / (processedHistory.length || 1);
      predictions = Array(days).fill(avg || 10);
      confidence = 0.5;
    }

    const predictedUsage = predictions[predictions.length - 1] || 0;

    return {
      material_id: materialId,
      material_name: material.material_name,
      target_date: targetDate,
      predicted_usage: parseFloat(predictedUsage.toFixed(2)),
      confidence_score: confidence,
      unit: material.unit || 'Unit',
      trend_analysis: predictedUsage > (processedHistory[processedHistory.length - 1]?.Quantity || 0) ? 'Increasing' : 'Decreasing',
      factors: ["Seasonality", "Historical Usage"],
      historical_data: processedHistory.slice(-10).map(h => ({ date: h.Date.toISOString().split('T')[0], usage: h.Quantity })),
      forecast_data: predictions.map((p, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return { date: d.toISOString().split('T')[0], predicted: parseFloat(p.toFixed(2)) };
      })
    };
  }

  async getMaterialPredictionOverview() {
    const materials = await this.materialRepository.find({ take: 10 }); // Limit for overview
    const results: any[] = [];

    for (const m of materials) {
      // Simple logic for 7d overview
      const stock = await this.inventoryRepository.findOne({ where: { material: { material_id: m.material_id } } });
      const currentStock = stock ? stock.quantity : 0;

      // Mock prediction for speed or reuse logic
      const predicted7d = Math.floor(Math.random() * 500) + 100; // Mock

      results.push({
        material_id: m.material_id,
        material_name: m.material_name,
        current_stock: currentStock,
        predicted_7d_usage: predicted7d,
        status: predicted7d > currentStock ? 'Critical' : 'Safe',
        trend_sparkline: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100))
      });
    }
    return results;
  }

  // Refactored runModel to be generic
  async runModelGeneric(historyData: any[], days: number) {
    const scriptPath = "./src/modules/forecast/python/prediction/prediction.py";

    return new Promise((resolve, reject) => {
      const py = spawn("python", [scriptPath]);
      py.stdin.write(JSON.stringify({
        productId: 0, // Dummy
        days,
        history: historyData
      }));
      py.stdin.end();

      let result = "";
      py.stdout.on("data", (d) => (result += d.toString()));
      py.stderr.on("data", (err) => reject(err.toString()));
      py.on("close", () => {
        let jsonText = result.substring(result.indexOf("{"), result.lastIndexOf("}") + 1);
        if (!jsonText) return resolve({ predictions: Array(days).fill(0), confidence: 0 }); // Fail safe
        try {
          jsonText = jsonText.replace(/(\w+)\s*:/g, '"$1":');
          resolve(JSON.parse(jsonText));
        } catch { resolve({ predictions: Array(days).fill(0), confidence: 0 }); }
      });
    });
  }


  async retrainMonthly() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 14);

    const newData = await this.productPlanRepository.find({
      where: {
        // plan_status: Status.COMPLETED,
        updated_at: Between(startDate, endDate),
      },
      order: { updated_at: "asc" },
    });

    if (!newData.length) {
      throw new NotFoundException("No data for retraining");
    }

    const scriptPath = path.join(
      process.cwd(),
      "src/modules/forecast/python/train-update.py"
    );

    const py = spawn("python", [scriptPath]);

    py.stdin.write(JSON.stringify(newData));
    py.stdin.end();

    return new Promise((resolve, reject) => {
      let result = "";

      py.stdout.on("data", (d) => (result += d.toString()));
      py.stderr.on("data", (err) => reject(err.toString()));

      py.on("close", () => {
        if (!result) {
          return reject("Python returned empty output");
        }
        try {
          resolve(JSON.parse(result));
        } catch {
          reject("Invalid JSON from python: " + result);
        }
      });
    });
  }

  async runModel(productId: number, days: number) {
    const history = await this.productPlanRepository.find({
      where: { product_id: productId },
      order: { start_date: "ASC" },
    });

    if (!history.length) {
      throw new NotFoundException("No history found for this product");
    }

    const lastData = history.map((h) => ({
      Date: h.start_date,
      Quantity: h.input_quantity,
    }));

    const py = spawn("python", [
      "./src/modules/forecast/python/prediction/prediction.py",
    ]);


    py.stdin.write(
      JSON.stringify({
        productId,
        days,
        history: lastData,
      })
    );
    py.stdin.end();

    return new Promise((resolve, reject) => {
      let result = "";

      py.stdout.on("data", (d) => (result += d.toString()));
      py.stderr.on("data", (err) => reject(err.toString()));

      py.on("close", () => {
        let jsonText = result.substring(result.indexOf("{"), result.lastIndexOf("}") + 1);

        if (!jsonText) {
          return reject("❌ No JSON found in Python output: " + result);
        }
        jsonText = jsonText.replace(/(\w+)\s*:/g, '"$1":');

        try {
          const parsed = JSON.parse(jsonText);
          resolve(parsed);
        } catch (e) {
          reject("❌ Invalid JSON after fixing: " + jsonText);
        }
      });
    });

  }

  async predict(productId: number, days: number) {
    const pythonOutput: any = await this.runModel(productId, days);
    const predictions: number[] = pythonOutput?.predictions || [];

    // ดึงข้อมูล product + BOM ราย material
    const product = await this.productRepository.findOne({
      where: { product_id: productId },
      relations: ["boms", "boms.material", "boms.material.unit"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const materialUsage: {
      material_id: number;
      material_name: string;
      usage_per_piece: number;
      total_usage: number;
    }[] = [];

    const confidence = pythonOutput?.confidence;


    if (product.boms) {
      product.boms.forEach((bom) => {
        const usagePerPiece = bom.usage_per_piece; // อัตราการใช้ต่อ 1 ชิ้น
        const material = bom.material;

        const totalUsage =
          predictions.reduce((sum, qty) => sum + qty * usagePerPiece, 0);

        const result = {
          material_id: material.material_id,
          material_name: material.material_name,
          usage_per_piece: usagePerPiece,
          total_usage: totalUsage,
          unit: material.unit,
        }
        materialUsage.push(result)
      });
    }

    return {
      predictions,
      materialUsage,
      confidence,
      product,
      product_type: product.product_type,
    };
  }
}
