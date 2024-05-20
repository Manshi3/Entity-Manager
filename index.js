const express = require('express');
const app = express();
const path = require('path');
const db = require('./db');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const entityRouter = require('./routes/entities');
app.use('/api/entities', entityRouter);

app.get('/entity/:entityName', (req, res) => {
  const entityName = req.params.entityName;
  res.redirect(`/entity.html?entity=${entityName}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


