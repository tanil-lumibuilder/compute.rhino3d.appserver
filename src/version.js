
const appserverVersion = require('../package.json').version

async function getVersion() {

  let request = {
    'method':'GET',
    'headers': {'RhinoComputeKey': process.env.RHINO_COMPUTE_KEY }
  }
  console.log(request)

  const response = await fetch( process.env.RHINO_COMPUTE_URL + 'version', request )
  console.log(response)
  const result = await response.json()

  result.appserver = appserverVersion


  return result

}

module.exports = { getVersion }
