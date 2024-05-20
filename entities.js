const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper function to create a table
const createTable = async (entityName, attributes) => {
  const columns = attributes.map(attr => `${attr.name} ${attr.type}`).join(', ');
  const query = `CREATE TABLE ${entityName} (id INT AUTO_INCREMENT PRIMARY KEY, ${columns})`;
  await db.execute(query);
};

// Create a new entity
router.post('/', async (req, res) => {
  const { entityName, attributes } = req.body;

  try {
    await createTable(entityName, attributes);
    res.status(201).send({ message: 'Entity created successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const query = `SELECT table_name AS tableName FROM information_schema.tables where table_schema = 'test'`;

  try {
    const [rows] = await db.execute(query);
    const entities = rows.map(row => row.tableName);
    res.status(200).send(entities);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/:entityName/attributes', async (req, res) => {
  const { entityName } = req.params;

  const query = `SELECT column_name AS name, column_type AS type FROM information_schema.columns WHERE table_schema = 'test' AND table_name = '${entityName}' AND column_name<>'id'`;

  try {
    const [rows] = await db.execute(query, [entityName]);
    const attributes = rows.map(row => ({ name: row.name, type: row.type }));
    res.status(200).send(attributes);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// CRUD operations for entities
router.post('/:entityName', async (req, res) => {
  const { entityName } = req.params;
  const data = req.body;

  const columns = Object.keys(data).join(', ');
  const values = Object.values(data).map(val => `'${val}'`).join(', ');

  const query = `INSERT INTO ${entityName} (${columns}) VALUES (${values})`;

  try {
    await db.execute(query);
    res.status(201).send({ message: 'Record created successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.get('/:entityName', async (req, res) => {
  const { entityName } = req.params;

  const query = `SELECT * FROM ${entityName}`;

  try {
    const [rows] = await db.execute(query);
    res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.put('/:entityName/:id', async (req, res) => {
  const { entityName, id } = req.params;
  const data = req.body;

  const updates = Object.keys(data)
    .filter(key => data[key] !== undefined && data[key] !== null && data[key].trim() !== '')
    .map(key => `${key} = ?`);

  if (updates.length === 0) {
    return res.status(400).send({ error: 'No fields to update' });
  }

  const values = Object.keys(data)
    .filter(key => data[key] !== undefined && data[key] !== null && data[key].trim() !== '')
    .map(key => data[key]);

  values.push(id);

  try {
    const query = `UPDATE ${entityName} SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(query, values);
    res.status(200).send({ message: 'Record updated' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


router.delete('/:entityName/:id', async (req, res) => {
  const { entityName, id } = req.params;

  const query = `DELETE FROM ${entityName} WHERE id=${id}`;

  try {
    await db.execute(query);
    res.status(200).send({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
