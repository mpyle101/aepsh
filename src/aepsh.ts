import axios from 'axios'
import { shell } from './shell'

const app = shell('aepsh')
app.prompt = 'aepsh> '
app.set('session', 12345)
app.cmd('users <name>', 'show user information', args => {
  console.log('USERS', args.name, args.session)
})
const route = app.use('create', 'create a schedule')
route.cmd('schedule <name>', 'create a schedule', args => {
  console.log('CREATE SCHEDULE', args.name, args.session)
})

app.cmd(
  'connect <username|email> <password> [host]',
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
  },
  args => {
    args.positional('host', {
      describe: 'AEP server hostname',
      type: 'string',
      default: 'localhost'
    })
  }
)

app.run()
