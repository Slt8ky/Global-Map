"use client";

import { UserPayload } from "../types/UserPayload";

export default function (userPayload: UserPayload) {
    const { name, email, picture, lat, lng, updated_at } = userPayload;

    return (
        <div className="flex flex-col gap-1 w-14 rounded-lg marker select-none" data-email={email}>
            <img className="w-full rounded-tl-lg rounded-tr-lg rounded-bl-md rounded-br-md shadow-lg shadow-black/30" src={picture} />
            <div className="name flex justify-center items-center gap-1 w-fit px-1 py-0.5 rounded-tl-md rounded-tr-md rounded-bl-lg rounded-br-lg bg-pink-200/30 backdrop-blur-lg shadow-md shadow-black/30">
                <div className="relative w-1 h-1">
                    <span className="absolute bg-green-500 ring-green-800 shadow-lg rounded-full w-1 h-1 animate-ping"></span>
                    <span className="absolute bg-green-500 ring-green-800 shadow-lg rounded-full w-1 h-1"></span>
                </div>
                <span className="text-neutral-900 text-[.7rem] whitespace-nowrap">{name}</span>
            </div>
            <div className="info flex flex-col w-fit gap-1 py-1 whitespace-nowrap px-1 rounded-tl-md rounded-tr-md rounded-bl-lg rounded-br-lg bg-pink-200/30 backdrop-blur-lg shadow-md shadow-black/30">
                <span className="text-neutral-900 text-[.7rem]">{lat.toFixed(5)} | {lng.toFixed(5)}</span>
                <span className="text-neutral-900 text-[.7rem]">{updated_at}</span>
                <span className="text-neutral-900 text-[.7rem]">{email}</span>
            </div>
        </div>
    )
}