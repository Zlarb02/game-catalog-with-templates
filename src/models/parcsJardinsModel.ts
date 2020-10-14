import { Collection } from "mongodb";

export default class ParcJardinsModel {
  private collection: Collection;
  constructor(collection: Collection) {
    this.collection = collection;
  }

  findAll(): Promise<any> {
    return this.collection.find({}).toArray();
  }
}
