import { execFile } from 'child_process';
import shell from 'shelljs';

const config: any = {};

interface IWifiInfo {
  hw_addr: string;
  inet_addr: string;
  ap_addr: string;
  ap_ssid: string;
  unassociated: string;
}



export class WifiManager {
  async enableApMode() {

  }

  async isWifiEnabled() {

  }

  async getWifiInfo(): Promise<IWifiInfo> {
    try {
      const blah = await asyncExec('ifconfig wlan0');
      const blah2 = await asyncExec('iwconfig wlan0');
    } catch (err) {
      console.error(err);

      throw err;
    }

    return {
      hw_addr: '',
      inet_addr: '',
      ap_addr: '',
      ap_ssid: '',
      unassociated: ''
    };
  }
}

async function asyncExec(cmd: string) {
  return new Promise((resolve, reject) => {
    const child = execFile(cmd);
    child.addListener("error", reject);
    child.addListener("exit", resolve);
  });
}