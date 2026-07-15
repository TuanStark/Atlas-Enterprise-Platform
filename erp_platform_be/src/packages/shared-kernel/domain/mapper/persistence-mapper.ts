export interface PersistenceMapper<TDomain, TPersistence> {
  toDomain(persistence: TPersistence): TDomain;

  toPersistence(domain: TDomain): TPersistence;
}
