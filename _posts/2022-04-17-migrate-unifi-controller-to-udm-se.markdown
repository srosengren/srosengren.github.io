---
layout: post
title:  "Migrating a Unifi controller in place onto UDM SE"
date:   2022-04-17 18:13:00
tags: [networking,unifi,ubiquiti]
---

## Mini project goal
To replace my current gateway (Ubiquiti, but not Unifi) and Unifi controller with a UDM SE for a more integrated Unifi experience, being able to easily segregate my vlans, wlans, setup firewall rules, etc from a single interface. While keeping the settings and adopted devices that I have in the current Unifi controller, with as little manual work as possible.

## Attempts
1. [First setup attempt that did not work](#first-setup-attempt-that-did-not-work)
1. [Second setup attempt that was a breeze!](#second-setup-attempt-that-was-a-breeze)
1. [Actually migrating the controller](#actually-migrating-the-controller)

## Current setup
- Gateway: [EdgeRouter X](https://eu.store.ui.com/collections/operator-isp-infrastructure/products/edgerouter-x)
- Switches: 1x [Switch Flex Mini](https://eu.store.ui.com/collections/unifi-network-routing-switching/products/usw-flex-mini), 1x [Switch Lite 8 PoE](https://eu.store.ui.com/collections/unifi-network-routing-switching/products/unifi-switch-lite-8-poe)
- Access point: [Access Point nanoHD](https://eu.store.ui.com/collections/unifi-network-wireless/products/unifi-nanohd)
- Unifi controller: [Raspberry Pi 4 Modl B - 8GB](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/?variant=raspberry-pi-4-model-b-8gb) running [Unifi controller in Docker](https://github.com/linuxserver/docker-unifi-controller)

## Goal setup
- Gateway: [Dream Machine Special Edition](https://eu.store.ui.com/collections/unifi-network-unifi-os-consoles/products/dream-machine-se),
- Switches: 2x [Switch Flex Mini](https://eu.store.ui.com/collections/unifi-network-routing-switching/products/usw-flex-mini) (it's a shame to decommission the Lite 8 PoE, but the UDM SE has PoE ports for driving the Flex Mini's that I already have)
- Access point: [Access Point nanoHD](https://eu.store.ui.com/collections/unifi-network-wireless/products/unifi-nanohd) (I'm waiting for a 6E AP before upgrading)

## First setup attempt that did not work
Turns out that Unifi devices expects internet access during setup, so this might have been my own fault. Here's th outline of what I did:
1. Unpack the UDM SE and connect to power in the evening, but not internet since that would kill access for the rest of the family while I set it up. Realize from the device screen that it requires internet access in order to complete the setup.
1. The next morning: Connect UDM to internet, complete setup via the phone app which I already have and am logged in to. Do a ISP speed test, update controller software. All things that require an internet access, proving that the UDM has internet access.
1. Hard wire a PC to the UDM, realize that the PC doesn't have internet access, this PC does use a VPN connection though so maybe that's the issue.
1. Connect a wifi AP and setup it up, connect multiple devices (phones, ipads, laptops) to it and try to connect to the internet, without success.
1. Assume that there's a setting missing in the UDM. Navigate to https://unifi from the PC to see if there's something I've missed.
1. Fiddle around in the UDM dashboard since I've never seen it before, for about 1hr, before giving up and factory reseting the device, I honestly probably would have gotten away with just rebooting the device but I was getting tired.

## Second setup attempt that was a breeze
OK, so the UDM is now factory reset, let's try it again!
1. Since I now have a PC that's wired to the UDM, let's try to do the setup using that one instead of through the phone app.
1. I'd say that I get 1-2 more configuration screens when using the web interface instead of the phone app. I pick the default's for almost everything though.
1. The PC is able to connect to the internet as soon as the UDM has been setup, great success! I also verify in [http://unifi/network/default/settings/internet](http://unifi/network/default/settings/internet) that the UDM has the same public IP as it did before the reset.

## Actually migrating the controller
1. The absolut first thing I did before I started any of this, was to do a backup of my current Unifi controller from the wired PC that I knew I was going to use during setup of the UDM. The controller is running version 6.0.28 on https://192.168.140:8443. The backup is stored as a .unf file.
1. I navigate to [https://unifi/network/default/settings/system/maintenance](https://unifi/network/default/settings/system/maintenance) (which is the UDM) and restore the .unf file.
1. I navigate to [https://unifi/network/default/settings/wifi](https://unifi/network/default/settings/wifi) to verify that the wifi from the old controller is now listed on the UDM.
1. I verify that I still have internet access on my PC and that the backup hasn't messed it up.
1. I verify that the admin user from the old controller is listed on the UDM, and I assign it the same access rights as my UI.com acount that I used to setup the UDM. It feels like a good idea to have a local user with administrative rights.
1. I wire up the switches, the AP, and the devices as I want them connected, I also wire up the old controller in order to "forget" the devices from it so that the UDM may adopt them.
1. The switches and AP show up under [https://unifi/network/default/devices](https://unifi/network/default/devices), with the status "Adopting", which is a lie since they're still connected to the old controller. And they would still be saying "Adopting" forever until they've been forgotten in the controller.
1. I sign into the old controller, which now has an ip of 192.168.1.50 instead of 192.168.1.40. The device list on the old controller says "0/1 access points and 0/2 switches are available". Which makes sense since the host inform url of the devices are now incorrect (there's no controller running on 192.168.1.40 for them to connect to anymore).
1. I try to forget the devices from the old controller, but it reports that they're "busy", probably since they're trying to connect to the non-existant controller.
1. I reset the "Override Inform Host" setting on the UDM to false, as there's no controller running on that IP and I want the devices to adopt to the UDM.
1. I set the "Override inform host with controller hostname/IP" on [https://192.168.1.50:8443/manage/site/default/settings/controller](https://192.168.1.50:8443/manage/site/default/settings/controller) (which is the old controller) to point to 192.168.1.50.
1. I force provision the new setting to the devices.
1. I'm now able to forget the devices.
1. The devices now show up as adoptable in the UDM. which I do, and I'm done!