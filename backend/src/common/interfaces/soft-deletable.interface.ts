export interface ISoftDeletable {
    remove(id: number): Promise<void>;
    restore(id: number): Promise<void>;
}
