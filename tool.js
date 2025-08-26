// Part lists
const sortableParts = [
  "Melody",
  "Harmony I",
  "Harmony II",
  "Counter Melody",
  "Counter Melody Harmony",
  "Bass"
];

const allParts = [
  ...sortableParts,
  "Groove","Chords","Drum Kit","Melody & Bass","Melody & Chords","Chords & Bass",
  "Melody & Chords & Bass","Timpani","Triangle"
];

// Full cycle order for middle instruments
const fullCycle = ["1 Melody","6 Bass","2 Harmony","4 Counter Melody","3 Harmony II","5 Counter Melody Harmony"];

// Instrument definitions
const instrumentDefinitions = {
  "Violin":      { instrumentPart: "Melody", Octave: +1 },
  "Viola":       { instrumentPart: "Harmony II", Octave: 0 },
  "Cello":       { instrumentPart: "Counter Melody", Octave: -1 },
  "Double Bass": { instrumentPart: "Bass", Octave: -2 },
  "Piccolo":     { instrumentPart: "Melody", Octave: +2 },
  "Flute":       { instrumentPart: "Melody", Octave: +1 },
  "Bb Clarinet": { instrumentPart: "Harmony I", Octave: +1 },
  "Oboe":        { instrumentPart: "Harmony II", Octave: +1 },
  "Bassoon":     { instrumentPart: "Counter Melody", Octave: -1 }
};

// Render instrument selection inputs
document.addEventListener("DOMContentLoaded", () => {
  const optionsDiv = document.getElementById("instrumentOptions");
  Object.keys(instrumentDefinitions).forEach(inst => {
    const label = document.createElement("label");
    label.textContent = inst + ": ";
    const numberInput = document.createElement("input");
    numberInput.type = "number";
    numberInput.min = 0;
    numberInput.value = 0;
    numberInput.name = inst;
    label.appendChild(numberInput);
    optionsDiv.appendChild(label);
  });
});

// Form submission processing
document.getElementById("instrumentForm").addEventListener("submit", event => {
  event.preventDefault();

  const assignments = [];

  // Create instrument instances based on quantities
  Object.keys(instrumentDefinitions).forEach(inst => {
    const count = parseInt(document.querySelector(`input[name='${inst}']`).value);
    for (let i = 1; i <= count; i++) {
      const partRole = instrumentDefinitions[inst].instrumentPart;
      let sortNum;

      if (sortableParts.includes(partRole)) {
        sortNum = sortableParts.indexOf(partRole) + 1;
        const octave = instrumentDefinitions[inst].Octave || 0;
        sortNum -= octave;
      } else {
        sortNum = "n/a";
      }

      assignments.push({
        instrument: `${inst} ${i}`,
        instrumentPart: partRole,
        assignedPart: "",
        sortNumber: sortNum,
        Octave: instrumentDefinitions[inst].Octave
      });
    }
  });

  if (assignments.length === 0) {
    alert("Please select at least one instrument.");
    return;
  }

  // Step 0: Pre-assign instruments 7-15
  assignments.forEach(instr => {
    const partIndex = allParts.indexOf(instr.instrumentPart);
    if (partIndex >= 6) {
      instr.assignedPart = instr.instrumentPart;
    }
  });

  // Step 1: Sort numeric instruments and tie-break
  const numericAssignments = assignments.filter(a => a.sortNumber !== "n/a");
  numericAssignments.sort((a,b) => a.sortNumber - b.sortNumber);

  // Tie-break by alphabet if sortNumber is same
  let currentGroup = [];
  let currentSortNumber = null;

  numericAssignments.forEach(instr => {
    if (instr.sortNumber !== currentSortNumber) {
      if (currentGroup.length > 1) {
        currentGroup.sort((a, b) => a.instrument.localeCompare(b.instrument));
        currentGroup.forEach((inst, i) => {
          inst.sortNumber = parseFloat((currentSortNumber + (i + 1)/10).toFixed(1));
        });
      } else if (currentGroup.length === 1) {
        currentGroup[0].sortNumber = parseFloat(currentGroup[0].sortNumber.toFixed(1));
      }
      currentGroup = [instr];
      currentSortNumber = instr.sortNumber;
    } else {
      currentGroup.push(instr);
    }
  });

  if (currentGroup.length > 1) {
    currentGroup.sort((a, b) => a.instrument.localeCompare(b.instrument));
    currentGroup.forEach((inst, i) => {
      inst.sortNumber = parseFloat((currentSortNumber + (i + 1)/10).toFixed(1));
    });
  } else if (currentGroup.length === 1) {
    currentGroup[0].sortNumber = parseFloat(currentGroup[0].sortNumber.toFixed(1));
  }

  // Step 2-4: Assign parts with full cycle logic
  const numericInstruments = numericAssignments;
  if (numericInstruments.length > 0) {
    // Lowest numeric → "1 Melody"
    numericInstruments[0].assignedPart = "1 Melody";

    // Highest numeric → "6 Bass"
    const highestIndex = numericInstruments.length - 1;
    numericInstruments[highestIndex].assignedPart = "6 Bass";

    // Next four instruments after lowest, before highest
    const nextFour = numericInstruments.slice(1, Math.min(5, highestIndex));
    const nextFourOrder = ["2 Harmony","4 Counter Melody","3 Harmony II","5 Counter Melody Harmony"];
    nextFour.forEach((instr, i) => {
      instr.assignedPart = nextFourOrder[i % nextFourOrder.length];
    });

    // Remaining instruments
    const remaining = numericInstruments.slice(nextFour.length + 1, highestIndex);
    remaining.forEach((instr, i) => {
      instr.assignedPart = fullCycle[i % fullCycle.length];
    });
  }

  // Merge final results and sort by sortNumber
  const finalAssignments = [
    ...numericAssignments,
    ...assignments.filter(a => a.sortNumber === "n/a")
  ];

  finalAssignments.sort((a, b) => {
    if (a.sortNumber === "n/a") return 1;
    if (b.sortNumber === "n/a") return -1;
    return a.sortNumber - b.sortNumber;
  });

  // Display as table with only instrument and assignedPart
  let tableHTML = "<table><tr><th>Instrument</th><th>Assigned Part</th></tr>";
  finalAssignments.forEach(inst => {
    tableHTML += `<tr><td>${inst.instrument}</td><td>${inst.assignedPart}</td></tr>`;
  });
  tableHTML += "</table>";

  document.getElementById("output").innerHTML = tableHTML;
});
