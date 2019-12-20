import { shell } from './shell'

const app = shell('aepsh')
app.prompt = 'aepsh> '
app.set('session', 12345)
app.use('sites <name>', 'show site information', args => {
  console.log('SITES', args.name, args.session)
})
app.use('users <name>', 'show user information', args => {
  console.log('USERS', args.name, args.session)
})
const route = app.route('create', 'create a schedule')
route.use('schedule <name>', 'create a schedule', args => {
  console.log('CREATE SCHEDULE', args.name, args.session)
})
app.run()
