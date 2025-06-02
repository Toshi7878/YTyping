import preMidLinks from "@/public/images/manual/premid/premid-link.png";
import preMidPresence1 from "@/public/images/manual/premid/premid-presence-1.png";
import preMidPresence2 from "@/public/images/manual/premid/premid-presence-2.png";
import Image from "next/image";

export function PreMidLinkImage() {
  return (
    <Image
      alt="PreMID拡張機能を開いてDiscordアカウントとリンクします。"
      src={preMidLinks}
      width={250}
      height={0}
      className="border-border mt-2 rounded border"
    />
  );
}

export function PreMidPresenceImages() {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <Image
        width={250}
        height={0}
        alt="スクリーンショット1"
        src={preMidPresence1}
        className="border-border rounded border"
      />
      <Image
        width={250}
        height={0}
        alt="スクリーンショット2"
        src={preMidPresence2}
        className="border-border rounded border"
      />
    </div>
  );
}
