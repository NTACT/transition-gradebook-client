import { observable, action } from 'mobx';
let store;

class Model {
  static setStore(_store) {
    store = _store;
  }

  static getStore() {
    return store;
  }

  static fromArray(array) {
    const ModelClass = this;
    return array.map(raw => new ModelClass(raw));
  }

  // Turns raw object fields into model instances
  static parseModelFields(target, fieldMap, defaultOptions) {
    for(let [key, modelDescriptor] of Object.entries(fieldMap)) {
      if(typeof modelDescriptor === 'function') {
        modelDescriptor = {
          Model: modelDescriptor,
          expectArray: false,
        };
      } else if(Array.isArray(modelDescriptor)) {
        modelDescriptor = {
          Model: modelDescriptor[0],
          expectArray: true,
        };
      }
      const { Model, expectArray } = modelDescriptor;
      const rawModel = target[key];
      let parsedModel;

      if(expectArray) {
        if(rawModel && (Array.isArray(rawModel) || rawModel.$mobx.array)) {
          parsedModel = rawModel.map(v => Model.wrapModel(Model, v)).filter(v => !!v);
        } else {
          parsedModel = [];
        }
      } else {
        parsedModel = this.wrapModel(Model, rawModel);
      }

      target[key] = parsedModel;
    }
  }

  static wrapModel(Model, value) {
    if(value instanceof Model) return value;
    if(value) return new Model(value);
    return null;
  }

  @observable store = store;
  @observable createdAt = null;
  @observable updatedAt = null;
  @observable deletedAt = null;

  rawFields = {};

  constructor(fields) {
    this.patch(fields);
  }

  @action patch(fields) {
    if(fields) {
      Object.assign(this.rawFields, fields);
      Object.assign(this, fields);
      this.modelFields({
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date,
      });
    }
    return this;
  }

  clone() {
    const Self = this.constructor;
    return new Self(this.rawFields);
  }

  modelFields(fieldMap) {
    Model.parseModelFields(this, fieldMap);
    return this;
  }
}

export default Model;