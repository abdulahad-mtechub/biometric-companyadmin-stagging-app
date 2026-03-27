

// export const initSQLite = () => {
//   db.transaction(tx => {
//     tx.executeSql(
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         type TEXT,
//         data TEXT,
//         timestamp INTEGER
//       )`,
//     );
//   });
// };

// // Save a pending POST action
//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         (_, result) => resolve(result),
//         (_, error) => reject(error),
//       );
//     });
//   });
// };

// // Get all pending POST actions of a type
// export const getPendingActions = type => {
//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         [type],
//         (_, {rows}) => resolve(rows.raw()),
//         (_, error) => reject(error),
//       );
//     });
//   });
// };

// // Remove a pending action by id
// export const removePendingAction = id => {
//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       tx.executeSql(
//         [id],
//         (_, result) => resolve(result),
//         (_, error) => reject(error),
//       );
//     });
//   });
// };

import SQLite from 'react-native-sqlite-storage';
import logger from '@utils/logger';

const db = SQLite.openDatabase({name: 'app.db', location: 'default'});

// Initialize pending_actions table
export const initSQLite = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS pending_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        data TEXT,
        timestamp INTEGER
      )`,
    );
  });
};

// Rebuild FormData from plain object when syncing
export const rebuildFormData = data => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value?.uri && value?.name && value?.type) {
      formData.append(key, {
        uri: value.uri,
        name: value.name,
        type: value.type,
      });
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

// Save pending action
export const savePendingAction = (type, data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO pending_actions (type, data, timestamp) VALUES (?, ?, ?)',
        [type, JSON.stringify(data), Date.now()],
        (_, result) => {
         
          resolve(result);
        },
        (error, _) => {
          logger.error('❌ Error saving pending action:', error, { context: 'savePendingAction' });

          reject(error);
        },
      );
    });
  });
};
export const saveUpdatePendingAction = (type, data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {

      tx.executeSql(
        'SELECT id FROM pending_actions WHERE type = ? LIMIT 1',
        [type],
        (_, { rows }) => {
          if (rows.length > 0) {
            // 2. UPDATE the existing record
            tx.executeSql(
              `UPDATE pending_actions 
               SET data = ?, timestamp = ? 
               WHERE type = ?`,
              [JSON.stringify(data), Date.now(), type],
              (_, result) => resolve(result),
              (_, error) => reject(error)
            );
          } else {
            // 3. INSERT new record
            tx.executeSql(
              `INSERT INTO pending_actions (type, data, timestamp) 
               VALUES (?, ?, ?)`,
              [type, JSON.stringify(data), Date.now()],
              (_, result) => resolve(result),
              (_, error) => reject(error)
            );
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};



// Get pending actions
export const getPendingActions = type => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pending_actions WHERE type = ?',
        [type],
        (_, {rows}) => resolve(rows.raw()),
        (_, error) => reject(error),
      );
    });
  });
};

export const formDataToObject = formData => {
  const obj = {};
  formData._parts.forEach(([key, value]) => {
    if (typeof value === 'object' && value?.uri) {
      obj[key] = {
        uri: value.uri,
        name: value.name,
        type: value.type,
      };
    } else {
      obj[key] = value;
    }
  });
  return obj;
};

// Remove pending action
export const removePendingAction = id => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM pending_actions WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};

export const getAllPendingActions = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pending_actions',
        [],
        (_, {rows}) => resolve(rows.raw()),
        (_, error) => reject(error),
      );
    });
  });
};

export const syncPendingActions = async type => {
  try {
    const pending = await getPendingActions(type);

    for (const action of pending) {
      const {url, formData, token} = JSON.parse(action.data);
      const rebuiltFormData = rebuildFormData(formData); // rebuild for FormData

      try {
        const result = await postFormDataRequest(url, rebuiltFormData, token);
        if (result && result.error === false) {
          await removePendingAction(action.id);
        } else {
        }
      } catch (error) {
        logger.error(`🚨 Error syncing action ID ${action.id}:`, error, { actionId: action.id, context: 'syncPendingActions' });
      }
    }
  } catch (error) {
    logger.error('🚨 syncPendingActions error:', error, { type, context: 'syncPendingActions' });
  }
};
