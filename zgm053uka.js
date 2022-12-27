import { EventEmitter } from 'node:events'
import { HID } from 'node-hid'
import { usb } from 'usb'

const idVendor = 0x04d9 // Holtek Semiconductor, Inc.
const idProduct = 0xa052 // USB-zyTemp
const warmup = 30 // seconds until device is available

export default class ZGm053UKA extends EventEmitter {
  constructor () {
    super()
    try {
      this.device = this.initialize()
    } catch (err) {
      this.device = false
      usb.on('attach', device => {
        if (device.deviceDescriptor.idVendor === idVendor && device.deviceDescriptor.idProduct === idProduct) {
          setTimeout(() => {
            this.device = this.initialize()
          }, warmup * 1000)
        }
      })
    }
  }

  initialize () {
    const magicTable = [0, 0, 0, 0, 0, 0, 0, 0]
    const device = new HID(idVendor, idProduct)

    device.on('error', error => {
      this.emit('error', error)
      this.close()
      process.exit()
    })

    device.on('data', data => {
      const codeCO2 = 0x50
      const codeTemp = 0x42
      const message = decrypt(data)
      const value = (message[1] << 8) | message[2]
      switch (message[0]) {
        case codeCO2:
          this.emit('co2', value)
          break

        case codeTemp:
          this.emit('temp', value)
          break

        default:
          this.emit('other', { code: message[0], value, message: Buffer.from(message), raw: data })
      }
    })

    device.sendFeatureReport(magicTable)
    return device
  }

  close () {
    if (this.device) {
      this.device.removeAllListeners()
      this.device.close()
      this.device = false
    }
  }
}

function truncateU64 (n) {
  const s = n.toString(2)
  const b = s.substring(s.length - 64)
  return BigInt(`0b${b}`)
}

function decrypt (b) {
  // Decode buffer received from CO2 monitor.
  const magicWord = [132, 71, 86, 214, 7, 147, 147, 86] // b'Htemp99e'
  // Rearrange bytes and convert to long int
  let res = Buffer.from([2, 4, 0, 7, 1, 6, 5, 3].map(i => b[i])).readBigUInt64BE()
  // # Cyclic shift by 3 to the right
  res = truncateU64(res >> BigInt(3) | res << BigInt(61))
  // # Convert to list
  res = [56, 48, 40, 32, 24, 16, 8, 0].map(i => Number((res >> BigInt(i)) & BigInt(255)))
  // # Subtract and convert to uint8
  return res.map((n, i) => (n - magicWord[i]) & 0xFF)
}
