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
  constructor(private name: string, private shell: Shell) {}

  cmd(
    name: string,
    desc: string,
    handler: (args: any) => void
  ) {
    this.shell.cmd(`${this.name}-${name}`, desc, handler)
  }
}


/*** Shell ****/
class Shell {
  private rl: readline.Interface
  private cmds = new Map()
  private state = new Map()
  private parser = new cmdr.Command()

  constructor(
    name: string,
    prompt: string,
    istream: NodeJS.ReadStream,
    ostream: NodeJS.WriteStream
  ) {
    this.parser
      .name(name)
      .exitOverride(err => { throw err })

    this.parser
      .command('')
      .action(() => {})

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
      this.run()
    })
  }

  run() { this.rl.prompt() }
  set prompt(prompt: string) { this.rl.setPrompt(prompt) }
  set(key: string, value: any) { this.state.set(key, value) }
  use(name: string, desc: string) { return new Route(name, this) }

  cmd(
    name: string,
    desc: string,
    handler: (args: any) => void
  ) {
    this.cmds.set(name, handler)
    return this.parser
      .command(name)
      .description(desc)
      .action((...args) => this.call(name, args))
  }

  async call(cmd: string, args) {
    console.log(`cmd: ${cmd}, args: ${args}`)
    await this.cmds.get(cmd)(...args)
  }
}

