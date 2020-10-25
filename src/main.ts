import { testDeps } from "./check-prerequisites";
import { WifiManager } from "./wifi-manager";

(async () => {
  try {
    const wifiManager = new WifiManager();

    await testDeps({
      "binaries": ["dnsmasq", "hostapd", "iw"],
      "files": ["/etc/dnsmasq.conf"]
    });
    await wifiManager.isWifiEnabled();
    await wifiManager.enableApMode();
    await start_http_server();
  } catch (err) {
    console.error(err);
  }
})();

async function start_http_server() {

}