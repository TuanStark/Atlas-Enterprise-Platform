import { Identifier } from "../primitives/identifier";

export interface Repository<TEntity> {
    findById(id: Identifier): Promise<TEntity | null>;
    save(entity: TEntity): Promise<void>;
    delete(entity: TEntity): Promise<void>;
}