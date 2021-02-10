import ZGm053UKA from './zgm053uka.js'

const device = new ZGm053UKA()

device.on('co2', data => console.log(`CO₂ ${data}`))
device.on('temp', data => console.log(`Temp ${data}`))
// device.on('other', data => console.log(data))
device.on('error', error => console.log('error %O', error))

for (const signal of ['SIGUSR2', 'SIGINT', 'SIGTERM']) {
  process.on(signal, s => {
    console.log(`signal: ${s}`)
    device.close()
    process.exit()
  })
}
