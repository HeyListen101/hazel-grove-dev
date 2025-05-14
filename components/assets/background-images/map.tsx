"use client";

import { createClient } from "@/utils/supabase/client";

type Store = {
  storeid: string;
  owner: string;
  storestatus: string;
  name: string;
  datecreated: string;
  isarchived: boolean;
}

// Function to fetch all stores from the database
export const fetchStores = async (): Promise<{storeData: Store[], storeStatusMap: Record<string, boolean>}> => {
  const supabase = createClient();
  try {
    // Joined the tables and selected everything from both tables
    const { data: stores, error } = await supabase.from('store').select(`*, storestatus:storestatus(*)`);

    if (error) {
      return { storeData: [], storeStatusMap: {} };
    }

    // Create a map of store IDs to their status
    const storeStatusMap: Record<string, boolean> = {};
    
    stores?.forEach(store => {
      const isOpen = store.storestatus?.status === true;
      storeStatusMap[store.storeid] = isOpen;
    });
    return { storeData: stores || [], storeStatusMap };
  } catch (error) {
    return { storeData: [], storeStatusMap: {} };
  }
};

export const svgPathVal = {
  pie: "M256.03 76.47c-12.332-.298-23.413 6.18-23.06 22.468L18.655 273l.282 6.938v178.998l11.468-2.686l155.906-36.563l5.438 17.688l29.72-3.344l-3.407-21.81l69.312-16.25l8.844 10.25l21.842 1.624l-.937-18.844l121.938-28.625v.03c1.36-.2 2.667-.52 3.937-.936c.022-.01.04-.025.063-.033l20.812-4.875l7.22-1.687v-7.188l18.53-147.406c8.89-17.113-6.495-46.453-38.72-40.124c4.752-19.91-38.983-28.136-52.03-17.25c3.263-18.202-37.385-41.715-51.906-21.187c4.632-22.758-46.006-40.867-58.845-20.345c-2.41-13.453-18.07-22.568-32.094-22.906zm-10.28 39.655c2.336 2.81 7.442 5.542 13.406 6.844c5.964 1.3 12.622 1.13 16.375.155l8.94-2.313l2.436 8.938c2.21 8.203 6.852 11.33 14.438 12.97s17.768.34 25.844-2.876l10.375-4.156l2.25 10.937c1 4.886 7.39 11.092 16.343 14.313c8.954 3.22 19.15 2.73 23.53 0l11.283-7.032l2.78 13c1.227 5.752 4.534 9.73 9.656 12.594s12.08 4.212 19.063 3.375l2.25 18.563c-10.635 1.274-21.384-.563-30.44-5.625c-6.057-3.388-11.185-8.528-14.75-14.844c-9.637 2.4-20.165.986-29.686-2.44c-9.78-3.517-19.263-9.534-24.594-18.468c-8.934 2.288-18.56 2.914-27.844.907c-10.046-2.173-19.796-8.438-25.312-18.532c-5.44.405-11.155.037-16.906-1.22c-8.71-1.9-17.57-5.648-23.813-13.155l14.375-11.938zM434.78 232.28l.095.345c1.64-.385 1.946-.3 3.656 1.094c1.712 1.39 4.14 4.616 6.22 9.343c4.058 9.22 6.91 23.626 7.656 38.5v16c-.504 10.182-1.96 19.874-4.312 27.53c-1.743 5.672-3.982 10.19-6.156 12.938c-1.516 1.917-2.777 2.92-4 3.44L37.625 435.374V307.312c132.618-34.5 265.01-62.72 397.156-75.03zm-72.25 177.095l-26.436 3.063l14.562 21.312l24.97-4.438zm-62.78 25.03l-32 5.22l11.156 12.938l21.875 1.625l-1.03-19.782zm-157.25 29.5l-1.625 14.908l22.47 2.937l8.436-15.313l-29.28-2.53zm107.406 4.72l-24.312 3.156l1.75 16.158l31.687-2.75l-9.124-16.563z",
  restroom: "M80 48a48 48 0 1 1 96 0a48 48 0 1 1-96 0m40 304v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V325.2c-8.1 9.2-21.1 13.2-33.5 9.4c-16.9-5.3-26.3-23.2-21-40.1l30.9-99.1C44.9 155.3 82 128 124 128h8c42 0 79.1 27.3 91.6 67.4l30.9 99.1c5.3 16.9-4.1 34.8-21 40.1c-12.4 3.9-25.4-.2-33.5-9.4V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V352zM320 0c13.3 0 24 10.7 24 24v464c0 13.3-10.7 24-24 24s-24-10.7-24-24V24c0-13.3 10.7-24 24-24m144 48a48 48 0 1 1 96 0a48 48 0 1 1-96 0m-24 432v-96h-17.8c-10.9 0-18.6-10.7-15.2-21.1l9-26.9c-3.2 0-6.4-.5-9.5-1.5c-16.9-5.3-26.3-23.2-21-40.1l29.7-95.2c13.2-42.3 52.4-71.2 96.8-71.2s83.6 28.9 96.8 71.2l29.7 95.2c5.3 16.9-4.1 34.8-21 40.1c-3.2 1-6.4 1.5-9.5 1.5l9 26.9c3.5 10.4-4.3 21.1-15.2 21.1H584v96c0 17.7-14.3 32-32 32s-32-14.3-32-32v-96h-16v96c0 17.7-14.3 32-32 32s-32-14.3-32-32",
  eatery: "M7 22q-.425 0-.712-.288T6 21v-8.15q-1.35-.35-2.175-1.425T3 9V3q0-.425.288-.712T4 2t.713.288T5 3v5h1V3q0-.425.288-.712T7 2t.713.288T8 3v5h1V3q0-.425.288-.712T10 2t.713.288T11 3v6q0 1.35-.825 2.425T8 12.85V21q0 .425-.288.713T7 22m10 0q-.425 0-.712-.288T16 21v-8.525q-1.35-.45-2.175-1.887T13 7.325Q13 5.1 14.175 3.55T17 2t2.825 1.562T21 7.35q0 1.825-.825 3.25T18 12.475V21q0 .425-.288.713T17 22",
  clothing: "M5.707 3.879A3 3 0 0 1 7.828 3c.79 0 1.948-.22 2.302.711a2.001 2.001 0 0 0 3.74 0c.354-.93 1.513-.71 2.302-.71a3 3 0 0 1 2.12.878L22 7.586a2 2 0 0 1 0 2.828l-1.478 1.478c-.52.52-1.246.689-1.9.526l.272 5.432A3 3 0 0 1 15.898 21H8.102a3 3 0 0 1-2.996-3.15l.272-5.432a2 2 0 0 1-1.9-.526L2 10.414a2 2 0 0 1 0-2.828z",
  pizza: "M169.7.9c-22.8-1.6-41.9 14-47.5 34.7L110.4 80h1.6c176.7 0 320 143.3 320 320v1.6l44.4-11.8c20.8-5.5 36.3-24.7 34.7-47.5C498.5 159.5 352.5 13.5 169.7.9m230.1 409.3c.1-3.4.2-6.8.2-10.2c0-159.1-128.9-288-288-288c-3.4 0-6.8.1-10.2.2L.5 491.9c-1.5 5.5.1 11.4 4.1 15.4s9.9 5.6 15.4 4.1zM176 208a32 32 0 1 1 0 64a32 32 0 1 1 0-64m64 128a32 32 0 1 1 64 0a32 32 0 1 1-64 0M96 384a32 32 0 1 1 64 0a32 32 0 1 1-64 0",
  cookie: "M224 120a40 40 0 0 1-40-40a8 8 0 0 0-8-8a40 40 0 0 1-40-40a8 8 0 0 0-8-8a104 104 0 1 0 104 104a8 8 0 0 0-8-8M75.51 99.51a12 12 0 1 1 0 17a12 12 0 0 1 0-17m25 73a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Zm23-40a12 12 0 1 1 17 0a12 12 0 0 1-17-.02Zm41 48a12 12 0 1 1 0-17a12 12 0 0 1-.02 16.98Z",
  notebook: "M21.04 13.13c.14 0 .27.06.38.17l1.28 1.28c.22.21.22.56 0 .77l-1 1l-2.05-2.05l1-1c.11-.11.25-.17.39-.17m-1.97 1.75l2.05 2.05L15.06 23H13v-2.06zM3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v6L11 20v2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm2 0h2V5H5zm0 4v2h2v-2zm0 6v2h2v-2z",
  printer: "M3.25.5V3h7.5V.5a.5.5 0 0 0-.5-.5h-6.5a.5.5 0 0 0-.5.5m.638 9V13c0 .133.047.26.13.354a.42.42 0 0 0 .314.146h5.336a.42.42 0 0 0 .314-.146a.53.53 0 0 0 .13-.354V9.5zM.45 4.804a1.53 1.53 0 0 1 1.049-.41h11c.388 0 .766.144 1.05.41c.284.267.45.636.45 1.029v4.227c0 .393-.166.762-.45 1.03c-.284.265-.662.41-1.05.41h-1.138v-2c0-.69-.56-1.25-1.25-1.25H3.888c-.69 0-1.25.56-1.25 1.25v2H1.5c-.388 0-.766-.145-1.05-.41A1.4 1.4 0 0 1 0 10.06V5.833c0-.393.166-.762.45-1.029m8.864 1.444c0-.345.28-.625.625-.625h1.637a.625.625 0 1 1 0 1.25H9.94a.625.625 0 0 1-.625-.625Z",
  basket: "M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32l51.9 207.5C91 492 116.6 512 146 512h284c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-85.6L365.3 12.9c-6.1-11.7-20.6-16.3-32.4-10.2s-16.3 20.6-10.2 32.4L404.3 192H171.7zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16m96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16m128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-96c0-8.8 7.2-16 16-16s16 7.2 16 16",
  veggie: "M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74c-3.2-4-8.1-6-13.2-6s-10 2-13.3 6M244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L125.5 212v.1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4l-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l60.4 60.3l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136",
  meat: "M20.16 12.73A6.27 6.27 0 0 0 19.09 3c-2.01-1.33-4.7-1.34-6.73-.03c-1.76 1.13-2.73 2.89-2.9 4.71c-.13 1.32-.63 2.55-1.55 3.47l-.03.03c-1.16 1.16-1.16 2.93-.07 4.01l.99.99a2.794 2.794 0 0 0 3.95 0c.97-.97 2.25-1.5 3.64-1.65c1.37-.15 2.71-.75 3.77-1.8m-13.9 7.13c.27.56.18 1.24-.29 1.7a1.49 1.49 0 0 1-2.55-.98a1.49 1.49 0 0 1-.98-2.55c.46-.46 1.15-.56 1.7-.29l2.48-2.43c.14.19.3.41.48.59l.99.99c.21.2.41.37.67.52z",
  personnel: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53",
  park: "m91.963 80.982l.023-.013l-7.285-12.617h2.867v-.013c.598 0 1.083-.484 1.083-1.082c0-.185-.059-.351-.14-.503l.019-.011l-6.737-11.669h1.639v-.009a.773.773 0 0 0 .773-.772a.76.76 0 0 0-.1-.359l.013-.008l-9.802-16.979l-.01.006a1.32 1.32 0 0 0-1.186-.754c-.524 0-.968.311-1.185.752l-.005-.003l-9.802 16.978l.002.001a.75.75 0 0 0-.105.366c0 .426.346.772.773.772v.009h1.661l-6.737 11.669l.003.001a1.06 1.06 0 0 0-.147.513c0 .598.485 1.082 1.083 1.082v.013h2.894l-2.1 3.638l-8.399-14.548h4.046v-.018c.844 0 1.528-.685 1.528-1.528c0-.26-.071-.502-.186-.717l.015-.009l-9.507-16.467h2.313v-.012a1.09 1.09 0 0 0 1.091-1.092c0-.186-.059-.353-.141-.506l.019-.011L36.4 13.125l-.005.003a1.87 1.87 0 0 0-1.683-1.06c-.758 0-1.408.452-1.704 1.1L19.201 37.082l.003.002a1.06 1.06 0 0 0-.148.516a1.09 1.09 0 0 0 1.09 1.092v.012h2.345l-9.395 16.272a1.5 1.5 0 0 0-.316.92c0 .844.685 1.528 1.528 1.528v.018h4.084L8.252 75.007c-.24.314-.387.702-.387 1.128c0 1.032.838 1.87 1.871 1.87v.021h19.779v8.43c0 .815.661 1.477 1.476 1.477h7.383c.815 0 1.477-.661 1.477-1.477v-8.43h16.12l-1.699 2.943l.003.002c-.104.189-.18.396-.18.628c0 .732.593 1.325 1.325 1.325v.015h14.016v3.941c0 .578.469 1.046 1.046 1.046h5.232c.578 0 1.046-.468 1.046-1.046v-3.941h14.05v-.015c.732 0 1.326-.593 1.326-1.325a1.3 1.3 0 0 0-.173-.617",
  water: "M21.75 16.25L17 21l-2.75-3l1.16-1.16L17 18.43l3.59-3.59zM17.62 12C16.31 8.1 12 3.25 12 3.25S6 10 6 14c0 3.31 2.69 6 6 6h.34c-.22-.64-.34-1.3-.34-2c0-3.18 2.5-5.78 5.62-6",
  haircut: "m256 192l-39.5-39.5c4.9-12.6 7.5-26.2 7.5-40.5C224 50.1 173.9 0 112 0S0 50.1 0 112s50.1 112 112 112c14.3 0 27.9-2.7 40.5-7.5L192 256l-39.5 39.5c-12.6-4.9-26.2-7.5-40.5-7.5C50.1 288 0 338.1 0 400s50.1 112 112 112s112-50.1 112-112c0-14.3-2.7-27.9-7.5-40.5L499.2 76.8c7.1-7.1 7.1-18.5 0-25.6c-28.3-28.3-74.1-28.3-102.4 0zm22.6 150.6l118.2 118.2c28.3 28.3 74.1 28.3 102.4 0c7.1-7.1 7.1-18.5 0-25.6L342.6 278.6zM64 112a48 48 0 1 1 96 0a48 48 0 1 1-96 0m48 240a48 48 0 1 1 0 96a48 48 0 1 1 0-96",
  mail: "m7.172 11.334l2.83 1.935l2.728-1.882l6.115 6.033q-.242.079-.512.08H1.667c-.22 0-.43-.043-.623-.12zM20 6.376v9.457c0 .247-.054.481-.15.692l-5.994-5.914zM0 6.429l6.042 4.132l-5.936 5.858A1.7 1.7 0 0 1 0 15.833zM18.333 2.5c.92 0 1.667.746 1.667 1.667v.586L9.998 11.648L0 4.81v-.643C0 3.247.746 2.5 1.667 2.5z",
  money: "M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM128 416l-64 0 0-64c35.3 0 64 28.7 64 64zM64 224l0-64 64 0c0 35.3-28.7 64-64 64zM448 352c0-35.3 28.7-64 64-64l0 64-64 0zm64-192c-35.3 0-64-28.7-64-64l64 0 0 64zM384 256c0 61.9-43 112-96 112s-96-50.1-96-112s43-112 96-112s96 50.1 96 112zM252 208c0 9.7 6.9 17.7 16 19.6l0 48.4-4 0c-11 0-20 9-20 20s9 20 20 20l24 0 24 0c11 0 20-9 20-20s-9-20-20-20l-4 0 0-68c0-11-9-20-20-20l-16 0c-11 0-20 9-20 20z",
  coffee: "M96 64c0-17.7 14.3-32 32-32l320 0 64 0c70.7 0 128 57.3 128 128s-57.3 128-128 128l-32 0c0 53-43 96-96 96l-192 0c-53 0-96-43-96-96L96 64zM480 224l32 0c35.3 0 64-28.7 64-64s-28.7-64-64-64l-32 0 0 128zM32 416l512 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32z",
  milk: "M14.278 4.977a.95.95 0 0 0-.832-.477h-2.858a.96.96 0 0 0-.861.518c-.13.253-.296.589-.48.982h5.569a22 22 0 0 0-.538-1.023 M7.5 12c0-1.542.66-3.48 1.302-5h6.475c.616 1.43 1.223 3.275 1.223 5v7a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2zM9 12a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6A.5.5 0 0 0 9 12 M8.5 3 h7 a1 1 0 0 1 1 1 v1 a1 1 0 0 1 -1 1 h-7 a1 1 0 0 1 -1 -1 v-1 a1 1 0 0 1 1 -1 Z"
}

export const colors = {
  a: "#006600",
  b: "#319900",
  c: "#66CC00",
  d: "#8AD70E",
  e: "#90EE90",
  f: "#D6D8D9",
  g: "#F07474",
}

export const mapData = [
  // Top-Left Stores (Indices 0-8)
  { // 0: Top-Left Stores 1
    rowStart: 1, rowEnd: 2, colStart: 2, colEnd: 4,
    defaultColor: colors.a,
    viewBox: "0 0 640 512", icon: svgPathVal.restroom,
    storeId: '64bf8920-746d-4441-b14b-0ae92dab286d',
    position: 'top'
  },
  { // 1: Top-Left Stores 2
    rowStart: 1, rowEnd: 3, colStart: 4, colEnd: 6,
    defaultColor: colors.b,
    viewBox: "0 0 640 512", icon: svgPathVal.pie,
    storeId: 'a75bb856-f9e8-49f7-a19c-7930ba190bd5',
    position: 'top'
  },
  { // 2: Top-Left Stores 3
    rowStart: 1, rowEnd: 3, colStart: 6, colEnd: 8,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: 'd589a987-a8a1-4c0a-8d05-f5cc6a7f7a1c',
    position: 'top'
  },
  { // 3: Top-Left Stores 4
    rowStart: 1, rowEnd: 3, colStart: 8, colEnd: 10,
    defaultColor: colors.d,
    viewBox: "0 0 640 512", icon: svgPathVal.coffee,
    storeId: '5e6e07cf-6cc5-457a-81fa-bbb40f4adb51',
    position: 'top'
  },
  { // 4: Top-Left Stores 5
    rowStart: 1, rowEnd: 3, colStart: 10, colEnd: 11,
    defaultColor: colors.e,
    viewBox: "0 0 512 512", icon: svgPathVal.pizza,
    storeId: 'd266653a-9bb9-4667-972f-14cb2cb12ea8',
    position: 'top'
  },
  { // 5: Top-Left Stores 6
    rowStart: 1, rowEnd: 3, colStart: 11, colEnd: 12,
    defaultColor: colors.a,
    viewBox: "0 0 512 512", icon: svgPathVal.pizza,
    storeId: '2528f9d5-10c3-4e43-88b1-146ae2c1ae10',
    position: 'top'
  },
  { // 6: Top-Left Stores 7
    rowStart: 1, rowEnd: 3, colStart: 12, colEnd: 15,
    defaultColor: colors.b,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '7456ec64-52c4-4795-898a-9ff8d3215fec',
    position: 'top'
  },
  { // 7: Top-Left Stores 8
    rowStart: 1, rowEnd: 3, colStart: 15, colEnd: 17,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: 'd972e9f4-ddfc-4f8d-a42e-de89d2b4f1da',
    position: 'top'
  },
  { // 8: Leftmost Store
    rowStart: 3, rowEnd: 5, colStart: 1, colEnd: 2,
    defaultColor: colors.d,
    viewBox: "0 0 24 24", icon: svgPathVal.clothing,
    storeId: 'ea40e428-c8dd-4cba-a155-3a7d5daa8ba1',
    position: 'left'
  },

  // Top-Right Stores (Indices 9-26)
  { // 9: Top-Right Stores 1
    rowStart: 1, rowEnd: 2, colStart: 20, colEnd: 21,
    defaultColor: colors.a,
    viewBox: "0 0 256 256", icon: svgPathVal.cookie,
    storeId: 'bf89e6c9-85f6-40f6-a8b4-ae68cf41b01f',
    position: 'top'
  },
  { // 10: Top-Right Stores 2
    rowStart: 1, rowEnd: 2, colStart: 21, colEnd: 22,
    defaultColor: colors.b,
    viewBox: "0 0 256 256", icon: svgPathVal.cookie,
    storeId: '7a8fdd07-7b85-41a5-9188-fe36495fa306',
    position: 'top'
  },
  { // 11: Top-Right Stores 3
    rowStart: 1, rowEnd: 2, colStart: 22, colEnd: 23,
    defaultColor: colors.c,
    viewBox: "0 0 256 256", icon: svgPathVal.cookie,
    storeId: '23b57a8b-5f63-4372-9e16-7634e8f43441',
    position: 'top'
  },
  { // 12: Top-Right Stores 4
    rowStart: 1, rowEnd: 2, colStart: 23, colEnd: 24,
    defaultColor: colors.d,
    viewBox: "0 0 256 256", icon: svgPathVal.cookie,
    storeId: '14af284c-89d2-4206-8bd1-9ea009b630e3',
    position: 'top'
  },
  { // 13: Top-Right Stores 5
    rowStart: 1, rowEnd: 2, colStart: 24, colEnd: 25,
    defaultColor: colors.e,
    viewBox: "0 0 256 256", icon: svgPathVal.cookie,
    storeId: '0d9b534c-4dc5-4e2c-9af3-b0ca52bdf409',
    position: 'top'
  },
  { // 14: Top-Right Stores 6
    rowStart: 1, rowEnd: 2, colStart: 25, colEnd: 26,
    defaultColor: colors.a,
    viewBox: "0 0 256 256", icon: svgPathVal.cookie,
    storeId: '51766da5-fb72-4fef-a96e-a7f6ed3d239b',
    position: 'top'
  },
  { // 15: Top-Right Stores 7
    rowStart: 1, rowEnd: 3, colStart: 26, colEnd: 27,
    defaultColor: colors.b,
    viewBox: "0 0 24 24", icon: svgPathVal.notebook,
    storeId: '81b862f5-4da3-4881-8def-bafe0ac6e283',
    position: 'top'
  },
  { // 16: Top-Right Stores 8
    rowStart: 1, rowEnd: 3, colStart: 27, colEnd: 28,
    defaultColor: colors.c,
    viewBox: "0 0 14 14", icon: svgPathVal.printer,
    storeId: 'acb061a3-6e4a-43ce-990d-9237c0e1b314',
    position: 'top'
  },
  { // 17: Top-Right Stores 9
    rowStart: 1, rowEnd: 3, colStart: 28, colEnd: 29,
    defaultColor: colors.d,
    viewBox: "0 0 576 512", icon: svgPathVal.basket,
    storeId: '86c36c61-ecdc-4fea-a7af-168e3a9cb41d',
    position: 'top'
  },
  { // 18: Top-Right Stores 10
    rowStart: 1, rowEnd: 3, colStart: 29, colEnd: 30,
    defaultColor: colors.e,
    viewBox: "0 0 576 512", icon: svgPathVal.basket,
    storeId: '49c0f9c0-da7a-4732-8a9f-415ecb8f36df',
    position: 'top'
  },
  { // 19: Top-Right Stores 11
    rowStart: 1, rowEnd: 3, colStart: 30, colEnd: 31,
    defaultColor: colors.a,
    viewBox: "0 0 576 512", icon: svgPathVal.basket,
    storeId: 'ab00d975-ea9a-48f9-91ca-6a45a9218233',
    position: 'top'
  },
  { // 20: Top-Right Stores 12
    rowStart: 1, rowEnd: 3, colStart: 31, colEnd: 32,
    defaultColor: colors.b,
    viewBox: "0 0 576 512", icon: svgPathVal.basket,
    storeId: 'bdd1a932-4a64-43a4-9282-a3393fd0eb77',
    position: 'top'
  },
  { // 21: Top-Right Stores 13
    rowStart: 1, rowEnd: 2, colStart: 32, colEnd: 33,
    defaultColor: colors.c,
    viewBox: "0 0 512 512", icon: svgPathVal.veggie,
    storeId: '8d48db72-cf13-487f-855d-9840bace55df',
    position: 'top'
  },
  { // 22: Top-Right Stores 14
    rowStart: 1, rowEnd: 2, colStart: 33, colEnd: 34,
    defaultColor: colors.d,
    viewBox: "0 0 512 512", icon: svgPathVal.veggie,
    storeId: '767d6761-2b63-4f75-91ef-2a7c32271b83',
    position: 'top'
  },
  { // 23: Top-Right Stores 15
    rowStart: 1, rowEnd: 2, colStart: 34, colEnd: 35,
    defaultColor: colors.e,
    viewBox: "0 0 512 512", icon: svgPathVal.veggie,
    storeId: '7a1c2004-d951-4ecc-9e0c-a08b7d7eeae0',
    position: 'top'
  },
  { // 24: Top-Right Stores 16
    rowStart: 1, rowEnd: 2, colStart: 35, colEnd: 36,
    defaultColor: colors.a,
    viewBox: "0 0 512 512", icon: svgPathVal.veggie,
    storeId: '405d1a0f-b620-426a-a8db-80428a2c60f9',
    position: 'top'
  },
  { // 25: Top-Right Stores 17
    rowStart: 1, rowEnd: 2, colStart: 36, colEnd: 37,
    defaultColor: colors.b,
    viewBox: "0 0 512 512", icon: svgPathVal.veggie,
    storeId: 'e859ab86-eaf9-4cbc-9dca-14f389fee755',
    position: 'top'
  },
  { // 26: Top-Right Stores 18
    rowStart: 1, rowEnd: 3, colStart: 37, colEnd: 41,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.meat,
    storeId: 'a4bf315c-be4d-4066-929e-7f18810f529c',
    position: 'top'
  },

  // Rightmost Stores (Indices 27-39)
  { // 27: Rightmost 1
    rowStart: 4, rowEnd: 5, colStart: 39, colEnd: 41,
    defaultColor: colors.d,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '3edc0d84-dd1c-4195-836d-e22df3a9571e',
    position: 'right'
  },
  { // 28: Rightmost 2
    rowStart: 5, rowEnd: 6, colStart: 39, colEnd: 41,
    defaultColor: colors.e,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '57e7b9e8-74ac-4695-b924-09041fd2278c',
    position: 'right'
  },
  { // 29: Rightmost 3
    rowStart: 6, rowEnd: 7, colStart: 39, colEnd: 41,
    defaultColor: colors.a,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: 'bf83ff80-4b94-4731-b4dd-145dd0c90224',
    position: 'right'
  },
  { // 30: Rightmost 4
    rowStart: 7, rowEnd: 8, colStart: 39, colEnd: 41,
    defaultColor: colors.b,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: 'e349cc93-66a8-4ab0-9555-8c9d4585f837',
    position: 'right'
  },
  { // 31: Rightmost 5
    rowStart: 8, rowEnd: 9, colStart: 39, colEnd: 41,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '7076ad11-e371-48fd-bccd-46161c57e6d2',
    position: 'right'
  },
  { // 32: Rightmost 6
    rowStart: 9, rowEnd: 10, colStart: 39, colEnd: 41,
    defaultColor: colors.d,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '23636531-3c91-4204-8172-74111cc10046',
    position: 'right'
  },
  { // 33: Rightmost 7
    rowStart: 10, rowEnd: 11, colStart: 39, colEnd: 41,
    defaultColor: colors.e,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '05b9ebf4-0216-4099-9939-4861f6f11069',
    position: 'right'
  },
  { // 34: Rightmost 8
    rowStart: 11, rowEnd: 12, colStart: 39, colEnd: 41,
    defaultColor: colors.a,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: 'e3556f67-2766-4356-ba54-d5c74434a056',
    position: 'right'
  },
  { // 35: Rightmost 9
    rowStart: 13, rowEnd: 14, colStart: 39, colEnd: 41,
    defaultColor: colors.b,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '02c63a3c-31b6-4421-8e92-b8ee97a0285b',
    position: 'right'
  },
  { // 36: Rightmost 10
    rowStart: 14, rowEnd: 15, colStart: 39, colEnd: 41,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '63541b29-1b79-4986-883f-052771349ebb',
    position: 'right'
  },
  { // 37: Rightmost 11
    rowStart: 15, rowEnd: 16, colStart: 39, colEnd: 41,
    defaultColor: colors.d,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: 'e7918daa-4a7f-439c-9ece-48e843be2c95',
    position: 'right'
  },
  { // 38: Rightmost 12
    rowStart: 16, rowEnd: 17, colStart: 39, colEnd: 41,
    defaultColor: colors.e,
    viewBox: "0 0 24 24", icon: svgPathVal.eatery,
    storeId: '84230fec-fda9-4a45-9b6e-f8dc4e4a508a',
    position: 'right'
  },
  { // 39: Rightmost 13
    rowStart: 17, rowEnd: 18, colStart: 39, colEnd: 41,
    defaultColor: colors.a,
    viewBox: "0 0 576 512", icon: svgPathVal.money,
    storeId: '92b4c136-6ba8-4d3d-854d-6105a31115a4',
    position: 'right'
  },

  // Bottom Stores (Indices 40-52)
  { // 40: Bottom 1
    rowStart: 18, rowEnd: 19, colStart: 25, colEnd: 27,
    defaultColor: colors.b,
    viewBox: "0 0 576 512", icon: svgPathVal.money,
    storeId: '5453baa1-ac44-4aab-953c-41566080f12d',
    position: 'bottom'
  },
  { // 41: Bottom 2
    rowStart: 18, rowEnd: 19, colStart: 27, colEnd: 28,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.clothing,
    storeId: '13fd517d-0f7a-4dad-b21b-058df1b8a708',
    position: 'bottom'
  },
  { // 42: Bottom 3
    rowStart: 18, rowEnd: 19, colStart: 28, colEnd: 29,
    defaultColor: colors.d,
    viewBox: "0 0 640 512", icon: svgPathVal.pie,
    storeId: 'cea9dd2f-67bd-458b-bb58-dfaf4d52add8',
    position: 'bottom'
  },
  { // 43: Bottom 4
    rowStart: 18, rowEnd: 19, colStart: 29, colEnd: 30,
    defaultColor: colors.e,
    viewBox: "0 0 512 512", icon: svgPathVal.haircut,
    storeId: 'e3bf2e95-2655-4ad7-b3f8-6835fcae0c21',
    position: 'bottom'
  },
  { // 44: Bottom 5
    rowStart: 18, rowEnd: 19, colStart: 30, colEnd: 31,
    defaultColor: colors.a,
    viewBox: "0 0 24 24", icon: svgPathVal.clothing,
    storeId: 'e612b43e-9b86-42ec-a641-a2deca15f8c0',
    position: 'bottom'
  },
  { // 45: Bottom 6
    rowStart: 18, rowEnd: 19, colStart: 31, colEnd: 33,
    defaultColor: colors.b,
    viewBox: "0 0 24 24", icon: svgPathVal.clothing,
    storeId: '378c68a5-8854-41f8-99ac-dc23298bb988',
    position: 'bottom'
  },
  { // 46: Bottom 7
    rowStart: 19, rowEnd: 20, colStart: 25, colEnd: 27,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.clothing,
    storeId: 'ed64621f-b622-4ebf-8676-7433db010a28',
    position: 'bottom'
  },
  { // 47: Bottom 8
    rowStart: 19, rowEnd: 20, colStart: 27, colEnd: 28,
    defaultColor: colors.d,
    viewBox: "0 0 20 20", icon: svgPathVal.mail,
    storeId: 'dd183dc4-3b40-4b5e-a6de-6580062f926e',
    position: 'bottom'
  },
  { // 48: Bottom 9
    rowStart: 19, rowEnd: 20, colStart: 28, colEnd: 29,
    defaultColor: colors.e,
    viewBox: "0 0 24 24", icon: svgPathVal.milk,
    storeId: '99337afb-2ec2-4cb4-995b-fcf40b2bb6b1',
    position: 'bottom'
  },
  { // 49: Bottom 10
    rowStart: 19, rowEnd: 20, colStart: 29, colEnd: 30,
    defaultColor: colors.a,
    viewBox: "0 0 576 512", icon: svgPathVal.basket,
    storeId: '0ec5837b-5b59-4e56-a673-6b98105e89db',
    position: 'bottom'
  },
  { // 50: Bottom 11
    rowStart: 19, rowEnd: 20, colStart: 30, colEnd: 31,
    defaultColor: colors.b,
    viewBox: "0 0 576 512", icon: svgPathVal.basket,
    storeId: '3c896041-6c47-41a5-9f05-3d46a581a91e',
    position: 'bottom'
  },
  { // 51: Bottom 12
    rowStart: 19, rowEnd: 20, colStart: 31, colEnd: 32,
    defaultColor: colors.c,
    viewBox: "0 0 14 14", icon: svgPathVal.printer,
    storeId: '2cc9f21d-38bc-4064-a1df-321508b4449c',
    position: 'bottom'
  },
  { // 52: Bottom 13
    rowStart: 19, rowEnd: 20, colStart: 32, colEnd: 33,
    defaultColor: colors.d,
    viewBox: "0 0 14 14", icon: svgPathVal.printer,
    storeId: 'b370821e-baa7-4f50-93c8-8fa56aee6ecc',
    position: 'bottom'
  },

  // Central Places (Indices 53-57)
  { // 53: Central 1
    rowStart: 5, rowEnd: 18, colStart: 20, colEnd: 24,
    defaultColor: colors.d,
    viewBox: "0 0 24 24", icon: svgPathVal.personnel,
    storeId: '558a8735-1a1e-4672-a1f2-50c1793d3035',
    position: 'bottom',
  },
  // { 54: Central 2 (Tree - non-interactive as per original JSX)
  //   rowStart: 7, rowEnd: 17, colStart: 25, colEnd: 33,
  //   defaultColor: colors.e,
  //   viewBox: "0 0 100 100", icon: svgPathVal.park,
  //   storeId: null, // Explicitly '' as is undefined
  //   position: null // Explicitly '' as is undefined
  // },
  { // 55: Central 3
    rowStart: 13, rowEnd: 15, colStart: 34, colEnd: 36,
    defaultColor: colors.c,
    viewBox: "0 0 24 24", icon: svgPathVal.water,
    storeId: '8cf59478-c5fb-426d-afd3-29b724866021',
    position: 'bottom',
  },
  { // 56: Central 4
    rowStart: 15, rowEnd: 17, colStart: 34, colEnd: 35,
    defaultColor: colors.b,
    viewBox: "0 0 512 512", icon: svgPathVal.haircut,
    storeId: '68769d27-1592-451c-a2e1-5c29947fe57d',
    position: 'right',
  },
  { // 57: Central 5
    rowStart: 15, rowEnd: 17, colStart: 35, colEnd: 36,
    defaultColor: colors.a,
    viewBox: "0 0 24 24", icon: svgPathVal.personnel,
    storeId: '5ad7a95c-5765-4f4a-bd19-d65c09fa6a0f',
    position: 'left',
  },
];