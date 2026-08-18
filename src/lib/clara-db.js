import { getDatabase } from "./clara-database.js";

const db = {
  get data() {
    try {
      return getDatabase().db.data;
    } catch {
      if (!global.dbData) {
        global.dbData = { users: {}, groups: {}, settings: {}, stats: {} };
      }
      return global.dbData;
    }
  },
  async write() {
    try {
      const database = getDatabase();
      if (database && typeof database.save === 'function') {
        await database.save();
      }
    } catch {
      // noop
    }
  }
};

export default db;
