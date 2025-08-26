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

const cycleOrder = [
  "1 Melody",
  "2 Harmony",
  "4 Counter Melody",
  "3 Harmony II",
  "5 Counter Melody Harmony",
  "6 Bass"
];

// Your instrument definitions
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

  // Step 1: Sort numeric instruments and apply tie-breaking decimals
  const numericAssignments = assignments.filter(a => a.sortNumber !== "n/a");
  numericAssignments.sort((a,b) => a.sortNumber - b.sortNumber);

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

  // Step 2: Assign lowest → 1 Melody, highest → 6 Bass
  const middleNumeric = numericAssignments.filter(a => a.assignedPart === "");
  if (middleNumeric.length > 0) {
    middleNumeric.sort((a,b) => a.sortNumber - b.sortNumber);
    middleNumeric[0].assignedPart = "1 Melody";
    middleNumeric[middleNumeric.length - 1].assignedPart = "6 Bass";
  }

  // Step 3: Cycle remaining middle instruments
  const remainingMiddle = middleNumeric.filter(a => a.assignedPart === "");
  let cycleIndex = 1; // skip first ("1 Melody")
  remainingMiddle.forEach(instr => {
    instr.assignedPart = cycleOrder[cycleIndex];
    cycleIndex++;
    if (cycleIndex >= cycleOrder.length - 1) cycleIndex = 1;
  });

  // Merge final results
  const finalAssignments = [
    ...numericAssignments,
    ...assignments.filter(a => a.sortNumber === "n/a")
  ];

  // Display results
 // Sort final assignments by sortNumber (numeric first, then n/a last)
finalAssignments.sort((a, b) => {
  if (a.sortNumber === "n/a") return 1;
  if (b.sortNumber === "n/a") return -1;
  return a.sortNumber - b.sortNumber;
});

// Create a simple table
let tableHTML = "<table border='1' cellpadding='5' cellspacing='0'><tr><th>Instrument</th><th>Assigned Part</th></tr>";
finalAssignments.forEach(inst => {
  tableHTML += `<tr><td>${inst.instrument}</td><td>${inst.assignedPart}</td></tr>`;
});
tableHTML += "</table>";

document.getElementById("output").innerHTML = tableHTML;


  console.log("Final assignments:", finalAssignments);
});
