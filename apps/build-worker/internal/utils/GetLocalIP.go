package utils

import (
    "net"
    "strings"
    "log"
)

func GetLocalIP() string {
    interfaces, err := net.Interfaces()
    if err != nil {
        log.Printf("Failed to get network interfaces: %v", err)
        return ""
    }

    for _, iface := range interfaces {
        if iface.Flags&net.FlagUp == 0 {
            continue // interface down
        }
        if iface.Flags&net.FlagLoopback != 0 {
            continue // loopback interface
        }

        addrs, err := iface.Addrs()
        if err != nil {
            continue
        }
        for _, addr := range addrs {
            var ip net.IP
            switch v := addr.(type) {
            case *net.IPNet:
                ip = v.IP
            case *net.IPAddr:
                ip = v.IP
            }
            if ip == nil || ip.IsLoopback() {
                continue
            }
            ip = ip.To4()
            if ip == nil {
                continue // not ipv4
            }
            if strings.HasPrefix(iface.Name, "eth") {
                return ip.String()
            }
        }
    }
    return ""
}


//fetch the container's IP address for a specific network interface, usually eth0 inside Docker containers.