export interface ReadModelMapper<TDomain, TReadModel> {
  toReadModel(domain: TDomain): TReadModel;
}
