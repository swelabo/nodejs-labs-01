import { loadConfig } from '../config.js'
import { openDatabase } from './database.js'

const database = openDatabase(loadConfig().databasePath)
database.close()
console.log('Database initialized')

