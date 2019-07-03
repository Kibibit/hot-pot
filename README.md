<p align="center">
  <a href="https://github.com/Kibibit/announce-it" target="blank"><img src="http://kibibit.io/kibibit-assets/hot-pot.svg" width="150" ></a>
  <h2 align="center">
    @kibibit/hot-pot
  </h2>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@kibibit/announce-it"><img src="https://img.shields.io/npm/v/@kibibit/announce-it/latest.svg?style=for-the-badge&logo=npm&color=CB3837"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@kibibit/announce-it"><img src="https://img.shields.io/npm/v/@kibibit/announce-it/next.svg?style=flat-square&logo=npm&color=CB3837"></a>
  <a href="https://travis-ci.org/Kibibit/announce-it">
  <img src="https://travis-ci.org/Kibibit/announce-it.svg?branch=master">
  </a>
  <a href="https://coveralls.io/github/Kibibit/announce-itbranch=master">
  <img src="https://coveralls.io/repos/github/Kibibit/announce-it/badge.svg?branch=master">
  </a>
  <a href="http://greenkeeper.io">
    <img src="https://badges.greenkeeper.io/Kibibit/announce-it.svg">
  </a>
  <a href="https://salt.bountysource.com/teams/kibibit"><img src="https://img.shields.io/endpoint.svg?url=https://monthly-salt.now.sh/kibibit&style=flat-square"></a>
</p>
<p align="center">
  A Node application which helps you onboard devices into a network without a screen
</p>
<hr>

Tested on Stretch and Raspberrt Pi 3

  Based on [this project](https://github.com/sabhiram/raspberry-wifi-conf). We basically wanted to improve upon this solution by prettifying it and making it work for other platforms

## RPI 4 Note:

I realize that a bunch of folks will try this out using the shiny new RaspberryPi v4. I caution you that this is not something I have tried, I believe this was tested on a Pi3 to success. However, if you find that this works on a Pi4, please let me know and I will adjust the readme accordingly. If it does not work, it is probably a few PRs away from success :)

## Why?

When unable to connect to a wifi network, this service will turn the RPI into a wireless AP. This allows us to connect to it via a phone or other device and configure our home wifi network (for example).

Once configured, it prompts the PI to reboot with the appropriate wifi credentials. If this process fails, it immediately re-enables the PI as an AP which can be configurable again.

This project broadly follows these [instructions](https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md) in setting up a RaspberryPi as a wireless AP.

## Requirements

The NodeJS modules required are pretty much just `underscore`, `async`, and `express`. 

The web application requires `angular` and `font-awesome` to render correctly. To make the deployment of this easy, one of the other requirements is `bower`.

If you do not have `bower` installed already, you can install it globally by running: `sudo npm install bower -g`.

## Install

```sh
$git clone https://github.com/sabhiram/raspberry-wifi-conf.git
$cd raspberry-wifi-conf
$npm update
$bower install
$sudo npm run-script provision
$sudo npm start
```


## Setup the app as a service

There is a startup script included to make the server starting and stopping easier. Do remember that the application is assumed to be installed under `/home/pi/raspberry-wifi-conf`. Feel free to change this in the `assets/init.d/raspberry-wifi-conf` file.

```sh
$sudo cp assets/init.d/raspberry-wifi-conf /etc/init.d/raspberry-wifi-conf 
$sudo chmod +x /etc/init.d/raspberry-wifi-conf  
$sudo update-rc.d raspberry-wifi-conf defaults
```

### Gotchas

#### `hostapd`

The `hostapd` application does not like to behave itself on some wifi adapters (RTL8192CU et al). This link does a good job explaining the issue and the remedy: [Edimax Wifi Issues](http://willhaley.com/blog/raspberry-pi-hotspot-ew7811un-rtl8188cus/). The gist of what you need to do is as follows:

```
# run iw to detect if you have a rtl871xdrv or nl80211 driver
$iw list
```

If the above says `nl80211 not found.` it means you are running the `rtl871xdrv` driver and probably need to update the `hostapd` binary as follows:
```
$cd raspberry-wifi-conf
$sudo mv /usr/sbin/hostapd /usr/sbin/hostapd.OLD
$sudo mv assets/bin/hostapd.rtl871xdrv /usr/sbin/hostapd
$sudo chmod 755 /usr/sbin/hostapd
```

Note that the `wifi_driver_type` config variable is defaulted to the `nl80211` driver. However, if `iw list` fails on the app startup, it will automatically set the driver type of `rtl871xdrv`. Remember that even though you do not need to update the config / default value - you will need to use the updated `hostapd` binary bundled with this app.

#### `dhcpcd` 

Latest versions of raspbian use dhcpcd to manage network interfaces, since we are running our own dhcp server, if you have dhcpcd installed - make sure you deny the wifi interface as described in the installation section. 

TODO: Handle this automatically.

## Usage

This is approximately what occurs when we run this app:

1. Check to see if we are connected to a wifi AP
2. If connected to a wifi, do nothing -> exit
3. (if not wifi, then) Convert RPI to act as an AP (with a configurable SSID)
4. Host a lightweight HTTP server which allows for the user to connect and configure the RPIs wifi connection. The interfaces exposed are RESTy so other applications can similarly implement their own UIs around the data returned.
5. Once the RPI is successfully configured, reset it to act as a wifi device (not AP anymore), and setup it's wifi network based on what the user selected.
6. At this stage, the RPI is named, and has a valid wifi connection which it is now bound to.

Typically, I have the following line in my `/etc/rc.local` file:
```
cd /home/pi/raspberry-wifi-conf
sudo /usr/bin/node server.js
```

Note that this is run in a blocking fashion, in that this script will have to exit before we can proceed with others defined in `rc.local`. This way I can guarantee that other services which might rely on wifi will have said connection before being run. If this is not the case for you, and you just want this to run (if needed) in the background, then you can do:

```
cd /home/pi/raspberry-wifi-conf
sudo /usr/bin/node server.js < /dev/null &
```

## User Interface

In my config file, I have set up the static ip for my PI when in AP mode to `192.168.44.1` and the AP's broadcast SSID to `rpi-config-ap`. These are images captured from my osx dev box.

Step 1: Power on Pi which runs this app on startup (assume it is not configured for a wifi connection). Once it boots up, you will see `rpi-config-ap` among the wifi connections.  The password is configured in config.json.

<img src="https://raw.githubusercontent.com/sabhiram/public-images/master/raspberry-wifi-conf/wifi_options.png" width="200px" height="160px" />

Step 2: Join the above network, and navigate to the static IP and port we set in config.json (`http://192.168.44.1:88`), you will see:

<img src="https://raw.githubusercontent.com/sabhiram/public-images/master/raspberry-wifi-conf/ui.png" width="404px" height="222px" />

Step 3: Select your home (or whatever) network, punch in the wifi passcode if any, and click `Submit`. You are done! Your Pi is now on your home wifi!!

## Testing

## License

MIT © 2019 Neil Kalman neilkalman@gmail.com

<div>Icons made by <a href="https://www.freepik.com/?__hstc=57440181.01962570f5556be13348a201c85fcdf4.1562144463167.1562144463167.1562144463167.1&__hssc=57440181.1.1562144463168&__hsfp=1026563361" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/"                 title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/"                 title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
