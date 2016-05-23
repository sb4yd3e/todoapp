import Neo4j from 'neo4j-transactions'

import config from '../config'

let configuration = {
  url: 'http://'+config.neo4jURL,
  credentials: {
    username: config.neo4jUSER,
    password: config.neo4jPASS
  }
}

const neo4jClient = Neo4j(configuration)

export default neo4jClient
