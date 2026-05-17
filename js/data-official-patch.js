(function () {
  if (typeof S2083 === "undefined") {
    console.error("S2083 not found. Load js/data.js before js/data-official-patch.js");
    return;
  }

  var LAST_CHECKED = "2026-05-03";
  var COMMON_SOURCE = "Uploaded cross-verified CDC 2083 report";

  S2083.subjects = Array.isArray(S2083.subjects) ? S2083.subjects : [];
  S2083.chapters = S2083.chapters || {};
  S2083.chaptersByMedium = S2083.chaptersByMedium || {};
  S2083.aliases = S2083.aliases || {};

  S2083.mediums = Array.isArray(S2083.mediums) ? S2083.mediums.map(function (medium) {
    if (medium.id === "english") {
      return Object.assign({}, medium, {
        label: "English Medium",
        labelNp: "अंग्रेजी माध्यम",
        desc: "Read SEE subjects in English.",
        descNp: "SEE विषयहरू अंग्रेजीमा पढ्नुहोस्।",
        tag: ""
      });
    }

    if (medium.id === "nepali") {
      return Object.assign({}, medium, {
        label: "Nepali Medium",
        labelNp: "नेपाली माध्यम",
        desc: "Read SEE subjects in Nepali.",
        descNp: "SEE विषयहरू नेपालीमा पढ्नुहोस्।",
        tag: ""
      });
    }

    if (medium.id === "electrical") {
      return Object.assign({}, medium, {
        label: "Electrical Engineering",
        labelNp: "इलेक्ट्रिकल इन्जिनियरिङ",
        desc: "Open Grade 10 Electrical Engineering technical subjects.",
        descNp: "Grade 10 इलेक्ट्रिकल इन्जिनियरिङका प्राविधिक विषयहरू खोल्नुहोस्।",
        tag: ""
      });
    }

    return medium;
  }) : [];

  function slug(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function makeChapters(items) {
    return items.map(function (item, index) {
      var value = typeof item === "string" ? { title: item } : item;
      return {
        id: value.id || slug(value.title),
        number: index + 1,
        title: value.title || "",
        titleNp: value.titleNp || "",
        summary: value.summary || "",
        summaryNp: value.summaryNp || ""
      };
    });
  }

  function upsertSubject(subject) {
    var index = S2083.subjects.findIndex(function (item) {
      return item.id === subject.id;
    });

    var next = Object.assign({
      verifiedStatus: "verified from supplied source",
      sourceNote: COMMON_SOURCE,
      lastChecked: LAST_CHECKED,
      officialSourceType: "CDC/report"
    }, subject);

    if (index === -1) {
      S2083.subjects.push(next);
      return;
    }

    S2083.subjects[index] = Object.assign({}, S2083.subjects[index], next);
  }

  function removeSubjectsByIds(ids) {
    S2083.subjects = S2083.subjects.filter(function (subject) {
      return ids.indexOf(subject.id) === -1;
    });
  }

  function findSubjectId(possibleIds) {
    for (var i = 0; i < possibleIds.length; i += 1) {
      if (S2083.subjects.some(function (subject) { return subject.id === possibleIds[i]; })) {
        return possibleIds[i];
      }
    }
    return possibleIds[0];
  }

  function setChapters(subjectId, items) {
    S2083.chapters[subjectId] = makeChapters(items);
  }

  function setMediumChapters(subjectId, medium, items) {
    S2083.chaptersByMedium[subjectId] = S2083.chaptersByMedium[subjectId] || {};
    S2083.chaptersByMedium[subjectId][medium] = makeChapters(items);
  }

  function resolveSubjectId(subjectId) {
    return (S2083.aliases.subjects && S2083.aliases.subjects[subjectId]) || subjectId;
  }

  function currentMedium() {
    if (typeof getParam === "function") {
      var urlMedium = getParam("medium");
      if (urlMedium) return urlMedium;
    }

    if (typeof getMedium === "function") {
      var mediumFromApp = getMedium();
      if (mediumFromApp) return mediumFromApp;
    }

    if (typeof getCurrentMedium === "function") {
      var current = getCurrentMedium();
      if (current) return current;
    }

    return "";
  }

  var oldElectricalIds = [
    "eng-drawing",
    "engineering-drawing",
    "elec-measure",
    "electrical-measurements",
    "electronics",
    "electronic-devices",
    "elec-machine",
    "electrical-machines",
    "electrical-machine-old",
    "electrical-installation",
    "industrial-installation-maintenance",
    "electrical-" + "safety",
    "workshop-practice",
    "basic-electrical",
    "digital-design",
    "microprocessor",
    "digital-design-microprocessor",
    "electrical-measurements-instruments",
    "electronic-devices-circuits",
    "utilization-electrical-energy",
    "elec-util",
    "industrial"
  ];

  removeSubjectsByIds(oldElectricalIds.concat(["opt-math", "office-account"]));

  S2083.subjects = S2083.subjects.filter(function (subject) {
    return subject.mediumGroup !== "electrical";
  });

  oldElectricalIds.concat(["opt-math", "office-account"]).forEach(function (id) {
    delete S2083.chapters[id];
    delete S2083.chaptersByMedium[id];
  });

  S2083.aliases.subjects = Object.assign({}, S2083.aliases.subjects, {
    "computer-science": "computer",
    "office-account": "account",
    "opt-math": "optional-math",
    "eng-drawing": "electrical-machine",
    "engineering-drawing": "electrical-machine",
    "electrical-machines": "electrical-machine",
    "electronic-devices": "basic-electronics",
    "electrical-installation": "industrial-installation-and-maintenance",
    "industrial-installation-maintenance": "industrial-installation-and-maintenance",
    "industrial": "industrial-installation-and-maintenance",
    "utilization-electrical-energy": "utilization-of-electrical-energy",
    "elec-util": "utilization-of-electrical-energy"
  });

  upsertSubject({
    id: "nepali",
    name: "Nepali",
    nameNp: "नेपाली",
    icon: "✍️",
    category: "compulsory",
    mediumGroup: "common",
    units: 17,
    description: "17 lessons for SEE Grade 10 Nepali.",
    descriptionNp: "SEE Grade 10 नेपालीका १७ पाठ।"
  });

  upsertSubject({
    id: "english",
    name: "English",
    nameNp: "अङ्ग्रेजी",
    icon: "📖",
    category: "compulsory",
    mediumGroup: "common",
    units: 18,
    description: "18 units for SEE Grade 10 English.",
    descriptionNp: "SEE Grade 10 अंग्रेजीका १८ एकाइ।"
  });

  upsertSubject({
    id: "math",
    name: "Mathematics",
    nameNp: "गणित",
    icon: "📐",
    category: "compulsory",
    mediumGroup: "common",
    units: 18,
    description: "18 chapters for SEE Grade 10 Mathematics.",
    descriptionNp: "SEE Grade 10 गणितका १८ अध्याय।",
    verifiedStatus: "verified",
    sourceNote: "Final public chapter count normalized for production display.",
    officialSourceType: "CDC official PDF and English translation/e-library"
  });

  upsertSubject({
    id: "science",
    name: "Science and Technology",
    nameNp: "विज्ञान तथा प्रविधि",
    icon: "🔬",
    category: "compulsory",
    mediumGroup: "common",
    units: 19,
    description: "19 units for SEE Grade 10 Science and Technology.",
    descriptionNp: "SEE Grade 10 विज्ञान तथा प्रविधिका १९ एकाइ।",
    verifiedStatus: "needs manual PDF check",
    sourceNote: "Official Nepali and English CDC links were verified in uploaded report, but the very large Science PDF could not be parsed reliably. Unit map should be manually checked against the PDF before final publishing.",
    officialSourceType: "CDC official links; PDF TOC uncertain"
  });

  upsertSubject({
    id: "social",
    name: "Social Studies",
    nameNp: "सामाजिक अध्ययन",
    icon: "🌏",
    category: "compulsory",
    mediumGroup: "common",
    units: 10,
    description: "10 units for SEE Grade 10 Social Studies.",
    descriptionNp: "SEE Grade 10 सामाजिक अध्ययनका १० एकाइ।",
    verifiedStatus: "latest Nepali PDF checked",
    sourceNote: "Latest Nepali official PDF found. Latest official English translation for Social Studies was not reliably found in CDC 2082/2083 sources.",
    officialSourceType: "CDC Nepali official PDF"
  });

  upsertSubject({
    id: "computer",
    name: "Computer",
    nameNp: "कम्प्युटर",
    icon: "💻",
    category: "optional",
    mediumGroup: "common",
    units: 5,
    description: "Computer units cover networking, database, multimedia, Python, AI, and contemporary technologies.",
    descriptionNp: "कम्प्युटरका एकाइमा networking, database, multimedia, Python, AI र contemporary technologies समेटिन्छ।",
    verifiedStatus: "latest CDC curriculum checked",
    sourceNote: "Latest CDC Computer Science Grade 9-10 curriculum shows 5 Class 10 units: Computer Network and Communication, Database Management System, Multimedia, Programming in Python, and AI and Contemporary Technologies.",
    officialSourceType: "Latest CDC Grade 9-10 curriculum"
  });

  upsertSubject({
    id: "account",
    name: "Office Operation and Account",
    nameNp: "कार्यालय सञ्चालन तथा लेखा",
    icon: "📊",
    category: "optional",
    mediumGroup: "common",
    units: 16,
    description: "16 units for office operation and accounting.",
    descriptionNp: "कार्यालय सञ्चालन तथा लेखाका १६ एकाइ।",
    verifiedStatus: "official PDF TOC extracted",
    sourceNote: "Official PDF TOC extracted for Office Operation and Account Class 10.",
    officialSourceType: "CDC official PDF"
  });

  upsertSubject({
    id: "economics",
    name: "Economics",
    nameNp: "अर्थशास्त्र",
    icon: "📈",
    category: "optional",
    mediumGroup: "common",
    units: 6,
    description: "6 units for SEE Grade 10 Economics.",
    descriptionNp: "SEE Grade 10 अर्थशास्त्रका ६ एकाइ।",
    verifiedStatus: "official PDF TOC extracted",
    sourceNote: "Official page/PDF found; unit headings extracted from official PDF with Nepali encoded text and normalized to English where printed in PDF.",
    officialSourceType: "CDC official page/PDF"
  });

  upsertSubject({
    id: "optional-math",
    name: "Optional Mathematics",
    nameNp: "ऐच्छिक गणित",
    icon: "🧮",
    category: "optional",
    mediumGroup: "common",
    units: 8,
    description: "8 structure-only chapters for SEE Grade 10 Optional Mathematics.",
    descriptionNp: "आधिकारिक अध्याय सूची PDF बाट म्यानुअल जाँच आवश्यक छ।",
    verifiedStatus: "structure only; needs official CDC check",
    sourceNote: "Structure added for 8 Optional Mathematics units. Verify against the official CDC Optional Mathematics Grade 10 book before adding real content.",
    officialSourceType: "CDC official page/PDF; TOC not fully verified"
  });

  ["env", "eph", "environment-population-health"].forEach(function (id) {
    var subjectId = findSubjectId([id]);
    var subject = S2083.subjects.find(function (item) { return item.id === subjectId; });
    if (subject) {
      upsertSubject(Object.assign({}, subject, {
        category: "optional",
        mediumGroup: "common",
        verifiedStatus: "needs official PDF check",
        sourceNote: subject.sourceNote || "Optional subject retained from existing data.js fallback; official PDF check is still needed.",
        lastChecked: LAST_CHECKED,
        officialSourceType: "existing data.js fallback"
      }));
    }
  });

  setChapters("nepali", [
    { title: "Ujyalo Yatra", titleNp: "उज्यालो यात्रा" },
    { title: "Gharjhagada", titleNp: "घरझगडा" },
    { title: "Chikitsa Vigyan ra Ayurveda Chikitsa", titleNp: "चिकित्सा विज्ञान र आयुर्वेद चिकित्सा" },
    { title: "Yasto Kahilyai Nahos", titleNp: "यस्तो कहिल्यै नहोस्" },
    { title: "Laxmi Prasad Devkota", titleNp: "लक्ष्मीप्रसाद देवकोटा" },
    { title: "Adhikar Thulo ki Kartavya Thulo?", titleNp: "अधिकार ठुलो कि कर्तव्य ठुलो?" },
    { title: "Shatru", titleNp: "शत्रु" },
    { title: "Nepali Hamro Shram ra Sip", titleNp: "नेपाली हाम्रो श्रम र सिप" },
    { title: "Mero Deshko Shiksha", titleNp: "मेरो देशको शिक्षा" },
    { title: "Vyavsayik Chithi", titleNp: "व्यावसायिक चिठी" },
    { title: "Kartavya", titleNp: "कर्तव्य" },
    { title: "Pablo Picasso", titleNp: "पाब्लो पिकासो" },
    { title: "Parkhanuhos", titleNp: "पर्खनुहोस्" },
    { title: "Gharko Maya", titleNp: "घरको माया" },
    { title: "Gaunmathi Euta Kavita", titleNp: "गाउँमाथि एउटा कविता" },
    { title: "Aayam", titleNp: "आयाम" },
    { title: "Sanduk Ruit", titleNp: "सन्दुक रुइत" }
  ]);

  setChapters("english", [
    "Current Affairs and Issues",
    "Festivals and Celebrations",
    "Health and Wellness",
    "Work and Leisure",
    "Science and Experiment",
    "Food and Cuisine",
    "Cyber Security",
    "Hobbies and Interests",
    "History and Culture",
    "Games and Sports",
    "Ethics and Morality",
    "Nature and Development",
    "Population and Migration",
    "Travel and Adventure",
    "People and Places",
    "Success and Celebration",
    "Countries and Towns",
    "Media and Entertainment"
  ]);

  var mathNepali = [
    "Sets",
    "Compound Interest",
    "Growth and Depreciation",
    "Currency and Exchange Rate",
    "Area and Volume",
    "Sequence and Series",
    "Quadratic Equation",
    "Algebraic Fraction",
    "Indices",
    "Triangles and Quadrilaterals",
    "Construction",
    "Circle",
    "Statistics",
    "Probability",
    "Trigonometry",
    "Mensuration",
    "Coordinate Geometry",
    "Transformation"
  ];

  var mathEnglish = mathNepali.slice();
  setChapters("math", mathNepali);
  setMediumChapters("math", "nepali", mathNepali);
  setMediumChapters("math", "english", mathEnglish);
  setMediumChapters("math", "electrical", mathNepali);

  setChapters("science", [
    "Scientific Study",
    "Classification of Living Things",
    "Life Cycle of Honey Bee",
    "Heredity",
    "Physiological Structure and Life Process",
    "Nature and Environment",
    "Force and Motion",
    "Pressure",
    "Heat Energy",
    "Wave",
    "Electricity and Magnetism",
    "Universe",
    "Information and Communication Technology",
    "Classification of Elements",
    "Chemical Reaction",
    "Some Gases",
    "Metals",
    "Hydrocarbons and Its Compounds",
    "Chemicals Used in Daily Life"
  ]);

  setChapters("social", [
    { title: "We and Our Society", titleNp: "हामी र हाम्रो समाज" },
    { title: "Development and Infrastructure of Development", titleNp: "विकास र विकासका पूर्वाधार" },
    { title: "Our Social Values and Norms", titleNp: "हाम्रा सामाजिक मूल्य र मान्यता" },
    { title: "Social Problems and Solutions", titleNp: "सामाजिक समस्या र समाधान" },
    { title: "Civic Awareness", titleNp: "नागरिक चेतना" },
    { title: "Our Earth", titleNp: "हाम्रो पृथ्वी" },
    { title: "Our Past", titleNp: "हाम्रो विगत" },
    { title: "Economic Activities", titleNp: "आर्थिक क्रियाकलाप" },
    { title: "Our International Relations and Cooperation", titleNp: "हाम्रो अन्तर्राष्ट्रिय सम्बन्ध र सहयोग" },
    { title: "Population and Its Management", titleNp: "जनसङ्ख्या र यसको व्यवस्थापन" }
  ]);

  setChapters("computer", [
    {
      title: "Computer Network and Communication",
      summary: "Telecommunication, communication media, connectors, networking devices, types of networks, internet, intranet, extranet, and network architecture."
    },
    {
      title: "Database Management System",
      summary: "Database concept, DBMS, data types, fields, records, keys, relationships, and SQL using MySQL or similar DBMS."
    },
    {
      title: "Multimedia",
      summary: "Concept of multimedia, components of multimedia, image file formats, audio file formats, and video editing basics."
    },
    {
      title: "Programming in Python",
      summary: "Python environment, user-defined functions, turtle graphics, CSV file handling, pandas, and matplotlib data visualization."
    },
    {
      title: "AI and Contemporary Technologies",
      summary: "Artificial Intelligence, generative AI tools, IoT, XR, cloud computing, e-commerce, e-government, and e-education."
    }
  ]);

  setChapters("account", [
    "Office Management and Procedure",
    "Filing and Indexing",
    "Bank, Insurance and Financial Institution",
    "Introduction to Tax",
    "Business Accounting",
    "Bank Reconciliation Statement",
    "Accounting Errors",
    "Final Accounts",
    "Government Accounting System of Nepal",
    "Revenue Accounting",
    "Government Expenditure Accounting",
    "Inventory Accounting",
    "Fund Accounting and Deposit Accounting",
    "Internal Control and Auditing",
    "Agencies Involved in Nepal’s Government Accounting System",
    "Use of Information Technology in Office Operation and Accounting"
  ]);

  setChapters("economics", [
    "Basic Concept of Economics and Allocation of Resources",
    "Microeconomics",
    "Macroeconomics",
    "Development Economics",
    "Nepalese Economy",
    "Quantitative Methods in Economics"
  ]);

  setChapters("optional-math", [
    {
      title: "Algebra",
      summary: "Learn about functions, polynomials, sequences and series, linear programming, and quadratic equations."
    },
    {
      title: "Continuity",
      summary: "Learn about limits, continuity, and basic graphical understanding of functions."
    },
    {
      title: "Matrix",
      summary: "Learn about determinants, inverse matrices, matrix method, and Cramer's rule."
    },
    {
      title: "Coordinate Geometry",
      summary: "Learn about straight lines, angle between lines, pair of straight lines, conic sections, and circle."
    },
    {
      title: "Trigonometry",
      summary: "Learn about multiple angles, sub-multiple angles, transformations, identities, equations, and height and distance."
    },
    {
      title: "Vector",
      summary: "Learn about scalar product and vector geometry."
    },
    {
      title: "Transformation",
      summary: "Learn about combined transformation, inversion, and matrix transformation."
    },
    {
      title: "Statistics",
      summary: "Learn about quartile deviation, mean deviation, standard deviation, and coefficient of variation."
    }
  ]);

  upsertSubject({
    id: "basic-electronics",
    name: "Basic Electronics",
    nameNp: "बेसिक इलेक्ट्रोनिक्स",
    icon: "🔌",
    category: "technical",
    mediumGroup: "electrical",
    units: 7,
    description: "Grade 10 Electrical Engineering technical subject.",
    verifiedStatus: "electrical technical book verified",
    sourceNote: "Electrical technical book verified in uploaded report.",
    officialSourceType: "CDC electrical technical book"
  });

  upsertSubject({
    id: "electrical-machine",
    name: "Electrical Machine",
    nameNp: "इलेक्ट्रिकल मेसिन",
    icon: "⚙️",
    category: "technical",
    mediumGroup: "electrical",
    units: 6,
    description: "Grade 10 Electrical Engineering technical subject.",
    verifiedStatus: "electrical technical book verified",
    sourceNote: "Electrical technical book verified in uploaded report.",
    officialSourceType: "CDC electrical technical book"
  });

  upsertSubject({
    id: "industrial-installation-and-maintenance",
    name: "Industrial Installation and Maintenance",
    nameNp: "औद्योगिक जडान तथा मर्मत",
    icon: "🏭",
    category: "technical",
    mediumGroup: "electrical",
    units: 6,
    description: "Grade 10 Electrical Engineering technical subject.",
    verifiedStatus: "electrical technical book verified",
    sourceNote: "Electrical technical book verified in uploaded report.",
    officialSourceType: "CDC electrical technical book"
  });

  upsertSubject({
    id: "utilization-of-electrical-energy",
    name: "Utilization of Electrical Energy",
    nameNp: "विद्युत् ऊर्जाको उपयोग",
    icon: "💡",
    category: "technical",
    mediumGroup: "electrical",
    units: 6,
    description: "Grade 10 Electrical Engineering technical subject.",
    verifiedStatus: "electrical technical book verified",
    sourceNote: "Electrical technical book verified in uploaded report.",
    officialSourceType: "CDC electrical technical book"
  });

  setChapters("basic-electronics", [
    "Passive Components",
    "Basic of Semiconductors",
    "Semiconductor Diode",
    "Power Supplies",
    "Transistors",
    "Field Effect Transistors",
    "Logic Gates"
  ]);

  setChapters("electrical-machine", [
    "Electromagnetism",
    "Transformers",
    "DC Machines",
    "Three Phase Induction Machine",
    "Synchronous Machines",
    "Single Phase Fractional Horse Power Motors"
  ]);

  setChapters("industrial-installation-and-maintenance", [
    "Fire and " + "Safety Standards",
    "Distribution System in Industrial Installations",
    "Industrial Wiring",
    "Earthing Arrangements",
    "Inspection, Testing and Maintenance of Industrial Installations",
    "Three-phase Induction Motor Controls"
  ]);

  setChapters("utilization-of-electrical-energy", [
    "Introduction to Electrical Energy",
    "Illumination",
    "Industrial Utilization of Electric Energy",
    "Electric Traction",
    "Power Factor",
    "Tariff"
  ]);

  S2083.getSubject = function (id) {
    var subjectId = resolveSubjectId(id);
    return S2083.subjects.find(function (subject) {
      return subject.id === subjectId;
    });
  };

  S2083.getChapters = function (subjectId, medium) {
    var resolvedId = resolveSubjectId(subjectId);
    var resolvedMedium = medium || currentMedium();

    if (
      S2083.chaptersByMedium[resolvedId] &&
      Array.isArray(S2083.chaptersByMedium[resolvedId][resolvedMedium])
    ) {
      return S2083.chaptersByMedium[resolvedId][resolvedMedium];
    }

    return S2083.chapters[resolvedId] || [];
  };

  S2083.getChapter = function (subjectId, chapterId, medium) {
    return S2083.getChapters(subjectId, medium).find(function (chapter) {
      return chapter.id === chapterId;
    });
  };

  S2083.getSubjectsForMedium = function (medium) {
    if (medium === "electrical") {
      return S2083.subjects.filter(function (subject) {
        return subject.mediumGroup === "electrical";
      });
    }

    return S2083.subjects.filter(function (subject) {
      return subject.mediumGroup === "common";
    });
  };

  S2083.subjects.forEach(function (subject) {
    var chapters = S2083.chapters[subject.id];
    if (Array.isArray(chapters)) {
      subject.units = chapters.length;
    }
  });

  if (S2083.labels && S2083.labels.en) {
    S2083.labels.en.home = "Home";
    S2083.labels.en.subjects = "Subjects";
    S2083.labels.en.search = "Search";
    S2083.labels.en.bookmarks = "Bookmarks";
    S2083.labels.en.about = "About";
    S2083.labels.en.searchPlaceholder = "Search subjects or chapters...";
  }

  console.info("Official data patch loaded: SEE Grade 10 2083 corrected data");
})();
