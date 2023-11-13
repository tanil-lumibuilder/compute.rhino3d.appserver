/**
 * Autogenerated UI for Grasshopper definitions
 * 
 * Routes:
 *  ('/')
 *     Show list of available definitions
 *  ('/:definition')
 *     Show autogenerated ui for definition
 */
const express = require('express')
const router = express.Router()
const getParams = require('../definitions.js').getParams

/**
 * Show list of available definitions
 */
router.get('/', async(req, res, next) => {
  view = {
    definitions: []
  }
  for (const definition of req.app.get('definitions')) {
    //console.log(definition)
    let data
    try {
      data = await getParams(definition.path)
    } catch (err) {
      console.log(err)
      next(err)
    }
    if(data)
      if(data.view) { view.definitions.push({ name: definition.name }) }
    
  }
  res.render('list', view)
})

/**
 * Show autogenerated ui for definition
 */
router.get('/:name', async (req, res, next) => {
  const definition = req.app.get('definitions').find(o => o.name === req.params.name)

  if (definition === undefined) {
    res.status(404).json({ message: 'Definition not found on server.' })
    return
  }

  const fullUrl = req.protocol + '://' + req.get('host')
  let definitionPath = `${fullUrl}/definition/${definition.id}`

  if(!Object.prototype.hasOwnProperty.call(definition, 'inputs')
     && !Object.prototype.hasOwnProperty.call(definition, 'outputs')) {

    let data
    try {
      data = await getParams(definitionPath)
    } catch (err) {
      next(err)
    }

    // cache
    definition.description = data.description
    definition.inputs = data.inputs
    definition.outputs = data.outputs

  }

  view = {
    name: definition.name,
    inputs: []
  }

  for (const input of definition.inputs) {
    const name = input.name
    const id = name
    switch (input.paramType) {
      case 'Integer':
        view.inputs.push({
          name: name,
          id: id,
          number: {
            value: input.default
          }
        })
        break;
      case 'Number':
        if (input.minimum !== undefined && input.minimum !== null
            && input.maximum !== undefined && input.maximum !== null)
        {

          let step = 1
          if( ( input.maximum - input.minimum ) < 1 ) {
            step = 0.1
          }
          // use range input if min and max set
          view.inputs.push({
            name: name,
            id: id,
            range: {
              min: input.minimum,
              max: input.maximum,
              value: input.default,
              step: step
            }
          })
        } else {
          // otherwise use number input
          view.inputs.push({
            name: name,
            id: id,
            number: {
              value: input.default
            }
          })
        }
        break
      case 'Boolean':
        view.inputs.push({
          name: name,
          id: id,
          bool: {
            value: input.default
          }
        })
        break
    }
  }

  res.render('definition', view)
})

module.exports = router
