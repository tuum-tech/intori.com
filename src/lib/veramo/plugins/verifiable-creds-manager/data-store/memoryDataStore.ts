import jsonpath from "jsonpath";
import { v4 } from "uuid";
import {
  AbstractDataStore,
  type IDeleteArgs,
  type IFilterArgs,
  type IQueryResult,
  type ISaveArgs,
} from "./abstractDataStore";

/**
 * An implementation of {@link AbstractDataStore} that stores everything in memory.
 */
export class MemoryDataStore extends AbstractDataStore {
  private data: Record<string, unknown> = {};

  configure: undefined;

  // eslint-disable-next-line @typescript-eslint/require-await
  public async saveVC(args: ISaveArgs): Promise<string[]> {
    const id = v4();
    this.data[id] = args.data;
    return [id];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async deleteVC(args: IDeleteArgs): Promise<boolean> {
    const { id } = args;
    if (id in this.data) {
      delete this.data[id];
      return true;
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async queryVC(args: IFilterArgs): Promise<IQueryResult[]> {
    const { filter } = args;
    if (filter && filter.type === "id") {
      try {
        if (this.data[filter.filter as string]) {
          const obj = [
            {
              metadata: { id: filter.filter as string },
              data: this.data[filter.filter as string],
            },
          ];
          return obj;
        }
        return [];
      } catch (e) {
        throw new Error("Invalid id");
      }
    }

    if (filter === undefined || (filter && filter.type === "none")) {
      return Object.keys(this.data).map((k) => {
        return {
          metadata: { id: k },
          data: this.data[k],
        };
      });
    }

    if (filter && filter.type === "jsonpath") {
      const objects = Object.keys(this.data).map((k) => {
        return {
          metadata: { id: k },
          data: this.data[k],
        };
      });
      const filteredObjects = jsonpath.query(objects, filter.filter as string);
      return filteredObjects as IQueryResult[];
    }
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async clearVCs(_args: IFilterArgs): Promise<boolean> {
    this.data = {};
    return true;
  }
}
