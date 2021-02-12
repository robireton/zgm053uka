# zgm053uka [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
get CO₂ concentration and temperature readings from a ZGm053UKA Mini CO₂ Monitor

## Setup
To let the program talk to the USB device on Linux create a file in `/etc/udev/rules.d/` with a name something like `98-ZGm053UKA.rules` with content:
```
SUBSYSTEM=="usb", ATTRS{idVendor}=="04d9", ATTRS{idProduct}=="a052", GROUP="plugdev", MODE="0664"
KERNEL=="hidraw*", ATTRS{idVendor}=="04d9", ATTRS{idProduct}=="a052", GROUP="plugdev", MODE="0664"
```

Be sure that the user the program runs as is part of the `plugdev` group.

For more help with installation, especially build errors, see the information about the modules this module depends on:
* [usb](https://www.npmjs.com/package/usb)
* [node-hid](https://www.npmjs.com/package/node-hid)


## Usage
Create a new instance of the device and then listen for events. Invoke the `.close()` method when done.
``` javascript
import ZGm053UKA from '@robireton/zgm053uka'

const device = new ZGm053UKA()

device.on('co2', data => console.log(`CO₂ ${data}`))
device.on('temp', data => console.log(`Temp ${data}`))
device.on('other', data => console.log(data))
device.on('error', error => console.log('error %O', error))

for (const signal of ['SIGUSR2', 'SIGINT', 'SIGTERM']) {
  process.on(signal, s => {
    console.log(`signal: ${s}`)
    device.close()
    process.exit()
  })
}
```

## Events

### co2
emits the concentration of CO₂ in parts per million as an integer

### temp
emits the temperature in sixteenths of a Kelvin as an integer. To convert to degrees Celsius, divide by 16 and subtract 273.15. To convert to degrees Fahrenheit, divide by 16, multiply by 9∕5, then subtract 459.67.

### other
The device emits other data points that I haven't deciphered yet. This event emits the code, value, ‘decrypted’ message, and raw message from the device.

## Methods

### close
Tell this module to stop listening to the underlying USB device.

## Acknowledgements
I learned how to decrypt the messages from reading the code for [vfilimonov/co2meter](https://github.com/vfilimonov/co2meter).

[Henryk Plötz](https://hackaday.io/project/5301) seems to have paved the way.

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

