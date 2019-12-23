import readline from 'readline'
import * as cmdr from 'commander'

const DEFAULT_PROMPT = '> '

/*** shell ***/
export const shell = (
  name: string,
  prompt = DEFAULT_PROMPT,
  istream = process.stdin,
  ostream = process.stdout
) => new Shell(name, prompt, istream, ostream)


/*** Route ****/
class Route {
  private cmds = new Map()
  protected state = new Map()
  protected parser = new cmdr.Command()

  constructor(cmd: string) {
    this.parser
      .name(cmd)
      .exitOverride(err => { throw err })
  }

  init = (state: Map<string, any>) => this.state = state

  cmd(
    name: string,
    desc: string,
    handler: (args: any) => void
  ) {
    this.cmds.set(name, handler)
    return this.parser
      .command(name)
      .description(desc)
      .action(cmd => this.call(name, cmd))
  }

  call(cmd: string, args: string[]) {
    console.log(`cmd: ${cmd}, args: ${args}`)
  }
}


/*** Shell ****/
class Shell extends Route {
  private rl: readline.Interface

  constructor(
    name: string,
    prompt: string,
    istream: NodeJS.ReadStream,
    ostream: NodeJS.WriteStream
  ) {
    super(name)

    this.parser
      .command('exit')
      .description('exit the application')
      .action(() => process.exit(0))

    this.parser
      .command('quit')
      .description('exit the application')
      .action(() => process.exit(0))

    this.parser.on('command:*', () => console.log('invalid command'))

    this.rl = readline.createInterface(istream, ostream)
    this.rl.setPrompt(prompt)

    this.rl.on('close', () => process.exit())
    this.rl.on('line', async line => {
      // Commander expects to be run via a node.js script.
      const args = ['node', 'script', ...line.trim().split(/\s+/)]
      try {
        this.parser.parse(args)
      } catch (e) {
        // console.log(e)
      }
      this.rl.prompt()
    })
  }

  set prompt(prompt: string) {
    this.rl.setPrompt(prompt)
  }

  set(key: string, value: any) {
    this.state.set(key, value)
  }

  run = () =>  this.rl.prompt()

  use(name: string, desc: string) {
    const route = new Route(name)
    route.init(this.state)
    this.parser
      .command(name)
      .description(desc)
      .action(cmd => route.call(name, cmd.parent.args))

    return route
  }
}