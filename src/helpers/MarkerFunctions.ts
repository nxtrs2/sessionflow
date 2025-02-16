// import { MarkerData, TickData } from "../types";

// export const handleAddEditMarker = (
//   markers: MarkerData[],
//   setMarkers: (markers: MarkerData[]) => void,
//   tick: TickData
// ) => {
//   const existingMarker = markers.find(
//     (marker) => marker.beat === tick.beatIndex
//   );
//   if (existingMarker) {
//     const newLabel = prompt("Edit marker label:", existingMarker.label);
//     if (newLabel) {
//       setMarkers((prevMarkers: MarkerData[]) =>
//         prevMarkers.map((marker: MarkerData) =>
//           marker.beat === tick.beatIndex
//             ? { ...marker, label: newLabel }
//             : marker
//         )
//       );
//     }
//   } else {
//     const label = prompt("Enter marker label:");
//     if (label) {
//       setMarkers((prevMarkers) => [
//         ...prevMarkers,
//         { label, beat: tick.beatIndex },
//       ]);
//     }
//   }
// };
