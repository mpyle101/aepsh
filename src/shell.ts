import readline from 'readline'
import yargs from 'yargs/yargs'

const DEFAULT_PROMPT = '>> '

/*** shell ***/
export const shell = (
  prompt = DEFAULT_PROMPT,
  istream = process.stdin,
  ostream = process.stdout
) => new Shell(prompt, istream, ostream)


/*** Route ***/
class Route {
  private cmds = new Map()
  private parser = yargs()

  constructor(private name: string) {}

  cmd(
    name: string,
    args: string,
    desc: string,
    handler: (args: any) => void
  ) {
    this.cmds.set(name, handler)
    return this.parser.command(`${name} ${args}`, desc)
  }

  run(line: string, args: any) {
    // Strip off the "route" command.
    const parts = line.split(' ')
    parts.shift()
    const argv = this.parser.parse(parts.join(' '), () => {})
    return this.cmds.get(argv._[0])(argv)
  }
}


/*** Command  ***/
class Command {
  constructor(private handler: (args: any) => void) {}

  run(line: string, args: any) {
    return this.handler(args)
  }
}


/*** Shell ***/
class Shell {
  private rl: readline.Interface
  private cmds = new Map<string, Command | Route>()
  private state = new Map()
  private parser = yargs()

  constructor(
    prompt: string,
    istream: NodeJS.ReadStream,
    ostream: NodeJS.WriteStream
  ) {
    this.parser
      .scriptName('')
      .exitProcess(false)

    this.parser.command('exit', 'exit the application', {}, () => process.exit(0))
    this.parser.command('quit', 'exit the application', {}, () => process.exit(0))

    this.rl = readline.createInterface(istream, ostream)
    this.rl.setPrompt(prompt)
    this.rl.on('close', () => process.exit())
    this.rl.on('line', async line => {
      try {
        const argv = this.parser.parse(line, () => {})
        if (argv._.length) {
          const cmd = this.cmds.get(argv._[0])
          if (cmd) {
            await cmd.run(line, argv)
          } else {
            console.log('Unknown command')
          }
        } else if (argv.help) {
          this.parser.showHelp()
        }
      } catch (e) {
        //console.log(e)
      }
      this.rl.prompt()
    })
  }

  run() { 
    this.parser.help()
    this.rl.prompt()
  }

  set prompt(prompt: string) { this.rl.setPrompt(prompt) }
  set(key: string, value: any) { this.state.set(key, value) }
  use(name: string, desc: string) {
    const route = new Route(name)
    this.cmds.set(name, route)
    return route
  }

  cmd(
    name: string,
    args: string,
    desc: string,
    handler: (args: any) => void
  ) {
    const cmd = new Command(handler)
    this.cmds.set(name, cmd)
    return this.parser.command(`${name} ${args}`, desc)
  }
}

