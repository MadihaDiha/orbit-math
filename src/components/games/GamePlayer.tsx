"use client";

import { GameShell } from "./GameShell";
import { CircleHunter } from "./CircleHunter";
import { RadiusOrDiameter } from "./RadiusOrDiameter";
import { PiDetective } from "./PiDetective";
import { OrbitCalculation } from "./OrbitCalculation";
import { BimoSpaceRescue } from "./BimoSpaceRescue";
import { ObjectIcon } from "@/components/cosmic/ObjectIcon";

export function GamePlayer({ slug }: { slug: string }) {
  return (
    <GameShell
      slug={slug}
      intro={
        slug === "circle-hunter" ? (
          <div className="flex gap-3 rounded-2xl bg-white/5 p-3 text-sm">
            <ObjectIcon name="coin" size={40} />
            <ObjectIcon name="egg" size={40} />
            <p>Hati-hati jebakan! Telur dan bola rugbi itu lonjong (oval), bukan lingkaran.</p>
          </div>
        ) : null
      }
    >
      {(finish) => {
        switch (slug) {
          case "circle-hunter":
            return <CircleHunter onFinish={finish} />;
          case "radius-or-diameter":
            return <RadiusOrDiameter onFinish={finish} />;
          case "pi-detective":
            return <PiDetective onFinish={finish} />;
          case "orbit-calculation":
            return <OrbitCalculation onFinish={finish} />;
          case "bimo-space-rescue":
            return <BimoSpaceRescue onFinish={finish} />;
          default:
            return null;
        }
      }}
    </GameShell>
  );
}
