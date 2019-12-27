import axios from 'axios'
import { shell } from './shell'

const app = shell('aepsh')

app.prompt = 'aepsh> '
app.set('session', 12345)
app.cmd('jester <name>', 'jester the tester', args => {
  console.log('JESTER', args.name)
})

const route = app.use('create', 'GOD MODE!')
route.cmd('jester <name>', 'create a tester', args => {
  console.log('CREATE JESTER', args.name)
})

app.cmd(
  'connect <username> <password> [host]',
  'connect to an AEP server',
  async args => {
    const http = axios.create({ baseURL: `https://${args.host}/api/vi` })
    try {
      const resp = await http.post('/authenticate', {
        email: args.username,
        password: args.password
      })
    } catch (e) {
      console.log(e.message)
    }

    return Promise.resolve()
  }
)

app.run()
