"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/util/supabase";
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { RealtimeChannel } from "@supabase/supabase-js";
import Script from 'next/script';
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getUser } from "./action/user";
import AppUrlListener from "./component/AppListener";
import Marker from "./component/Marker";
import { UserPayload } from "./types/UserPayload";

export default function Page() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const AMap = useRef<any>(null);
  const locationWatcher = useRef<string | number | null>(null);
  const channel = useRef<RealtimeChannel | null>(null);
  const user = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const isFirst = useRef<boolean>(true);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const InitAMapSecurityConfig = () => {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
    };
  };

  async function clearActiveWatcher() {
    if (!locationWatcher.current) return;

    if (Capacitor.getPlatform() === 'web') {
      navigator.geolocation.clearWatch(locationWatcher.current as number);
    } else {
      await Geolocation.clearWatch({ id: locationWatcher.current as string });
    }
    locationWatcher.current = null;
  }

  function updateMarker(userPayload: UserPayload) {
    const { email, lat, lng } = userPayload;

    const [final_lng, final_lat] = [lng, lat];

    const div = new DOMParser().parseFromString(
      renderToStaticMarkup(<Marker {...userPayload} />),
      "text/html"
    ).body.firstElementChild as HTMLElement;

    if (!markersRef.current[email]) {
      const marker = new AMap.current.Marker({
        map: mapInstance.current,
        content: div,
        position: [final_lng, final_lat],
        anchor: 'center',
        zIndex: 100
      });

      marker.on('mouseup', () => {
        const div: HTMLElement = marker.getContent();
        if (!div.classList.contains('active')) {
          for (const marker of Object.values(markersRef.current)) {
            marker.getContent().classList.remove('active');
          }
          div.classList.add('active');
          mapInstance.current.setCenter([lng, lat], false, 300);
        } else {
          div.classList.remove('active');
        }
      });

      markersRef.current[email] = marker;
    } else {
      markersRef.current[email].setPosition([lng, lat]);
      console.log(markersRef.current[email].getPosition());
      markersRef.current[email].moveAlong([
        markersRef.current[email].getPosition().toArray(),
        [lng, lat]
      ], {
        duration: 500,
        autoRotation: false
      });
      markersRef.current[email].setOffset([0, 0]);
      markersRef.current[email].setzIndex(100);
      if (markersRef.current[email].getContent().classList.contains('active')) {
        mapInstance.current.setCenter([lng, lat], false, 300);
        div.classList.add('active');
      }
      markersRef.current[email].setContent(div);
    }

    let offsetX = 0;
    let zIndex = 99;

    for (const [email, marker] of Object.entries(markersRef.current ?? {})) {
      if (email === user.current.email) continue;
      const [lng, lat] = marker.getPosition().toArray();
      const isNearbyLat = Math.abs(final_lat - lat) <= 0.00018;
      const isNearbyLng = Math.abs(final_lng - lng) <= 0.00018;
      if (isNearbyLat && isNearbyLng) {
        offsetX += 10;
        marker.setOffset(new AMap.current.Pixel(offsetX, 0));
        marker.setzIndex(zIndex--);
      }
    }
  }

  useEffect(() => {
    if (!scriptsLoaded) return;

    async function handlePermissions(): Promise<boolean> {
      if (Capacitor.getPlatform() === 'web') return true;

      try {
        let permStatus = await Geolocation.checkPermissions();
        if (permStatus.location !== 'granted') {
          permStatus = await Geolocation.requestPermissions({ permissions: ["coarseLocation", "location"] });
        }
        return permStatus.location === 'granted';
      } catch (e) {
        console.error("Failed handling native permission controls", e);
        return false;
      }
    }

    async function watchLocation() {
      await clearActiveWatcher();

      const callback = async (position: any) => {
        if (!user.current || !position) return;

        const { name, email, picture } = user.current;
        const { latitude: lat, longitude: lng } = position.coords;

        AMap.current.convertFrom([lng, lat], 'gps', async (_: any, result: any) => {
          if (result.info === 'ok' && result.locations) {
            const [lng, lat] = result.locations[0].toArray();
            const userPayload: UserPayload = { name, email, picture, lat, lng, updated_at: new Date().toLocaleTimeString() };

            if (isFirst.current && user.current.name === name) {
              mapInstance.current.setZoomAndCenter(18, [lng, lat]);
            }

            updateMarker(userPayload);

            await channel.current?.send({
              type: 'broadcast',
              event: isFirst.current ? 'offer' : 'answer',
              payload: { userPayload }
            });

            if (isFirst.current) {
              isFirst.current = false;
            }
          }
        });
      };

      const platform = Capacitor.getPlatform();
      if (platform === 'web') {
        locationWatcher.current = navigator.geolocation.watchPosition(
          callback,
          (err) => console.error(err),
          { enableHighAccuracy: true }
        );
      } else {
        const hasPermission = await handlePermissions();
        if (!hasPermission) {
          console.warn("Location permissions were rejected by the system user.");
          return;
        }

        locationWatcher.current = await Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }, callback);
      }
    }

    (async () => {
      user.current = await getUser();

      if (!user.current) {
        const platform = Capacitor.getPlatform();
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: platform === 'web' ? process.env.NEXT_PUBLIC_DOMAIN : 'app://', skipBrowserRedirect: false }
        });
        return;
      }

      AMap.current = await (window as any).AMapLoader.load({
        key: process.env.NEXT_PUBLIC_AMAP_KEY,
        version: "2.0",
        plugins: ["AMap.MoveAnimation"]
      });

      mapInstance.current = new AMap.current.Map(mapContainer.current, {
        center: [114.177216, 22.302711]
      });

      const myChannel = supabase.channel('global');

      myChannel
        .on('broadcast', { event: 'offer' }, ({ payload: { userPayload } }) => {
          console.log({ type: 'offer', ...userPayload });
          updateMarker(userPayload);
          watchLocation();
        })
        .on('broadcast', { event: 'answer' }, ({ payload: { userPayload } }) => {
          console.log({ type: 'answer', ...userPayload });
          updateMarker(userPayload);
        });

      channel.current = myChannel;

      myChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          watchLocation();
        }
      });
    })();

    return () => {
      clearActiveWatcher();
      if (channel.current) {
        channel.current.unsubscribe();
      }
    };
  }, [scriptsLoaded]);

  return (
    <>
      <AppUrlListener />
      <Script
        src="https://webapi.amap.com/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          InitAMapSecurityConfig();
          setScriptsLoaded(true);
        }}
      />
      <div className="w-full h-svh" ref={mapContainer}></div>
    </>
  );
}