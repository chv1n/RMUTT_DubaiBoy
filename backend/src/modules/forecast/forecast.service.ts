import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { spawn } from "child_process";
import { Repository } from "typeorm";
import { ProductPlan } from "../product-plan/entities/product-plan.entity";
import { Status } from 'src/common/enums/status.enum';
import { PlanList } from '../plan-list/entities/plan-list.entity';
import * as fs from "fs";
import * as json from "json";
import * as sys from "sys";
import { Product } from '../product/entities/product.entity';



@Injectable()
export class ForecastService {

  constructor(
    @InjectRepository(PlanList) private planProductRepository: Repository<PlanList>,
    @InjectRepository(ProductPlan) private productPlanRepository: Repository<ProductPlan>,
    @InjectRepository(Product) private productRepository: Repository<Product>
  ) { }


  async retrainMonthly() {
    const newData: PlanList[] = await this.planProductRepository.find({
      relations: {
        plan: true,
      },
      where: {
        status: Status.COMPLETED,
      },
      order: { updated_at: "asc" },
    });

    const py = spawn("python", ["./src/modules/forecast/python/train_update.py"]);

    py.stdin.write(JSON.stringify(newData));
    py.stdin.end();

    return new Promise(async (resolve, reject) => {
      let result = "";

      py.stdout.on("data", (d) => (result += d.toString()));
      py.stderr.on("data", (err) => reject(err.toString()));
      py.on("close", () => resolve(JSON.parse(result)));

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
      product,
      product_type: product.product_type,
    };
  }
}

