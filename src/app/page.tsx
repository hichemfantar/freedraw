import dynamic from "next/dynamic";
const DrawingApp = dynamic(() => import("@/components/drawing-app"), {
  ssr: false,
});

export default function Home() {
  return <DrawingApp />;
}
