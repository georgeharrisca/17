// Full list of part roles
const sortableParts = ["Melody","Harmony I","Harmony II","Counter Melody","Counter Melody Harmony","Bass"];
const allParts = [...sortableParts,"Groove","Chords","Drum Kit","Melody & Bass","Melody & Chords","Chords & Bass","Melody & Chords & Bass","Timpani","Triangle"];
const middleCycle = ["1 Melody","6 Bass","2 Harmony","4 Counter Melody","3 Harmony II","5 Counter Melody Harmony"];

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
    label.textContent = inst + ":";
    const numberInput = document.createElement("input");
    numberInput.type = "number";
    numberInput.min = 0;
    numberInput.value = 0;
    numberInput.name = inst;
    label.appendChild(numberInput);
    optionsDiv.appendChild(label);
  });
});

// Process form submission
document.getElementById("instrumentForm").addEventListener("submit", event => {
  event.preventDefault();
  const assignments = [];

  // Generate instrument instances
  Object.keys(instrumentDefinitions).forEach(inst => {
    const count = parseInt(document.querySelector(`input[name='${inst}']`).value);
    for (let i = 1; i <= count; i++) {
      const partRole = instrumentDefinitions[inst].instrumentPart;
      let sortNum;

      if (sortableParts.includes(partRole)) {
        sortNum = sortableParts.indexOf(partRole) + 1 - (instrumentDefinitions[inst].Octave || 0);
      } else {
        sortNum = "n/a";
      }

      assignments.push({
        instrument: `${inst} ${i}`,
        instrumentPart: partRole,
        assignedPart: "",
        sortNumber: sortNum,
        finalized: false
      });
    }
  });

  if (assignments.length === 0) {
    alert("Please select at least one instrument.");
    return;
  }

  // Step 0: Pre-assign instrumentPart 7-15
  assignments.forEach(instr => {
    const partIndex = allParts.indexOf(instr.instrumentPart);
    if (partIndex >= 6) {
      instr.assignedPart = instr.instrumentPart;
      instr.finalized = true;
    }
  });

  // Step 1: Numeric instruments
  let numericInstruments = assignments.filter(a => !a.finalized);

  // Sort by sortNumber ascending and alphabetically
  numericInstruments.sort((a,b) => {
    if (a.sortNumber === b.sortNumber) return a.instrument.localeCompare(b.instrument);
    return a.sortNumber - b.sortNumber;
  });

  // Step 1a: Tie-breaking decimals
  let lastSort = null;
  let tieCount = 0;
  numericInstruments.forEach(instr => {
    if (instr.sortNumber === lastSort) {
      tieCount += 1;
      instr.sortNumber = Number((instr.sortNumber + tieCount/10).toFixed(1));
    } else {
      tieCount = 0;
      instr.sortNumber = Number(instr.sortNumber.toFixed(1));
      lastSort = instr.sortNumber;
    }
  });

  // Step 2-4: Assign parts with finalized stages
  if (numericInstruments.length > 0) {
    // Lowest → 1 Melody
    numericInstruments[0].assignedPart = "1 Melody";
    numericInstruments[0].finalized = true;

    // Highest → 6 Bass
    const highestIndex = numericInstruments.length - 1;
    numericInstruments[highestIndex].assignedPart = "6 Bass";
    numericInstruments[highestIndex].finalized = true;

    // Next four lowest non-finalized → 2,4,3,5
    const nextFour = numericInstruments.filter(a => !a.finalized).slice(0,4);
    const nextFourOrder = ["2 Harmony","4 Counter Melody","3 Harmony II","5 Counter Melody Harmony"];
    nextFour.forEach((instr, i) => {
      instr.assignedPart = nextFourOrder[i];
      instr.finalized = true;
    });

    // Remaining → cycle middleCycle
    let remaining = numericInstruments.filter(a => !a.finalized);
    remaining.forEach((instr, i) => {
      instr.assignedPart = middleCycle[i % middleCycle.length];
      instr.finalized = true;
    });
  }

  // Final display sorted by sortNumber
  const finalAssignments = [...assignments];
  finalAssignments.sort((a,b) => {
    if (a.sortNumber === "n/a") return 1;
    if (b.sortNumber === "n/a") return -1;
    return a.sortNumber - b.sortNumber;
  });

  let tableHTML = "<table><tr><th>Instrument</th><th>Sort Number</th><th>Assigned Part</th></tr>";
  finalAssignments.forEach(instr => {
    tableHTML += `<tr>
      <td>${instr.instrument}</td>
      <td>${instr.sortNumber}</td>
      <td>${instr.assignedPart}</td>
    </tr>`;
  });
  tableHTML += "</table>";

  document.getElementById("output").innerHTML = tableHTML;
});
