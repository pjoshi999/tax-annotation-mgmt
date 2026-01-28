interface FormBackgroundProps {
  pageNumber: number;
  scale: number;
  pageWidth: number;
  pageHeight: number;
  formCode: string;
}

interface Section {
  y: number;
  height: number;
  label: string;
  isHeader?: boolean;
}

interface FieldLabel {
  y: number;
  label: string;
  labelRight?: string;
}

const PAGE1_SECTIONS: Section[] = [
  {
    y: 30,
    height: 20,
    label: "Form 1040 — U.S. Individual Income Tax Return (2025)",
    isHeader: true,
  },
  {
    y: 96,
    height: 18,
    label: "FILING STATUS",
    isHeader: true,
  },
  {
    y: 148,
    height: 18,
    label: "YOUR INFORMATION",
    isHeader: true,
  },
  {
    y: 240,
    height: 18,
    label: "ADDRESS",
    isHeader: true,
  },
  {
    y: 330,
    height: 18,
    label: "INCOME",
    isHeader: true,
  },
  {
    y: 660,
    height: 18,
    label: "ADJUSTED GROSS INCOME",
    isHeader: true,
  },
  {
    y: 740,
    height: 18,
    label: "STANDARD DEDUCTION",
    isHeader: true,
  },
];


const PAGE1_FIELD_LABELS: FieldLabel[] = [
  
  { y: 108, label: "☐ Single" },
  { y: 124, label: "☐ Married filing jointly" },

  
  {
    y: 166,
    label: "First name and initial",
    labelRight: "Your social security number",
  },
  { y: 206, label: "Last name" },

  
  { y: 256, label: "Home address (number and street)", labelRight: "Apt. no." },
  {
    y: 298,
    label: "City, town or post office",
    labelRight: "State    ZIP code",
  },

  
  { y: 350, label: "1   Wages, salaries, tips, etc. Attach Form(s) W-2" },
  { y: 382, label: "2a  Tax-exempt interest" },
  { y: 414, label: "2b  Taxable interest" },
  { y: 446, label: "3a  Qualified dividends" },
  { y: 478, label: "3b  Ordinary dividends" },
  { y: 510, label: "4a  IRA distributions" },
  { y: 542, label: "5a  Pensions and annuities" },
  { y: 574, label: "6   Social security benefits" },
  { y: 606, label: "9   Total income. Add lines 1 through 8" },

  
  { y: 680, label: "11  Adjusted gross income" },

  
  { y: 760, label: "12  Standard deduction or itemized deductions" },
  { y: 796, label: "13  Qualified business income deduction" },
  { y: 832, label: "14  Add lines 12 and 13" },
];

const PAGE2_SECTIONS: Section[] = [
  {
    y: 30,
    height: 20,
    label: "Form 1040 (2025) — Page 2",
    isHeader: true,
  },
  {
    y: 72,
    height: 18,
    label: "TAX AND CREDITS",
    isHeader: true,
  },
  {
    y: 190,
    height: 18,
    label: "PAYMENTS",
    isHeader: true,
  },
  {
    y: 360,
    height: 18,
    label: "REFUND",
    isHeader: true,
  },
  {
    y: 600,
    height: 18,
    label: "SIGNATURE",
    isHeader: true,
  },
];

const PAGE2_FIELD_LABELS: FieldLabel[] = [
  
  { y: 90, label: "15  Taxable income" },
  { y: 122, label: "16  Tax" },
  { y: 154, label: "17  Amount from Schedule 2" },

  
  { y: 210, label: "24  Federal tax withheld" },
  { y: 242, label: "25  Estimated tax payments" },
  { y: 274, label: "26  Earned income credit (EIC)" },
  { y: 306, label: "33  Total payments" },

  
  { y: 380, label: "34  Overpayment" },
  { y: 412, label: "35a Amount to be refunded" },
  { y: 444, label: "37  Amount you owe" },

  
  { y: 620, label: "Your signature", labelRight: "Date" },
  { y: 652, label: "Occupation" },
];

export function FormBackground({
  pageNumber,
  scale,
  pageWidth,
  pageHeight,
  formCode,
}: FormBackgroundProps) {
  if (formCode !== "1040") return null;

  const sections = pageNumber === 1 ? PAGE1_SECTIONS : PAGE2_SECTIONS;
  const fieldLabels =
    pageNumber === 1 ? PAGE1_FIELD_LABELS : PAGE2_FIELD_LABELS;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.6,
      }}
    >
      {}
      <div
        style={{
          position: "absolute",
          top: 20 * scale,
          left: 30 * scale,
          right: 30 * scale,
          bottom: 20 * scale,
          border: "1px solid #d0d0d0",
        }}
      />

      {}
      {sections.map((section, idx) => (
        <div key={idx}>
          <div
            style={{
              position: "absolute",
              left: 30 * scale,
              right: 30 * scale,
              top: section.y * scale,
              height: section.height * scale,
              background:
                section.isHeader && section.y <= 50
                  ? "#1a1a1a"
                  : section.isHeader
                    ? "#f5f5f5"
                    : "transparent",
              color: section.isHeader && section.y <= 50 ? "white" : "#666",
              display: "flex",
              alignItems: "center",
              paddingLeft: 8 * scale,
              fontSize: (section.y <= 50 ? 11 : 9) * scale,
              fontWeight: 700,
              textTransform: section.y <= 50 ? "none" : "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {section.label}
          </div>
        </div>
      ))}

      {}
      {fieldLabels.map((item, idx) => (
        <div key={idx}>
          {}
          <div
            style={{
              position: "absolute",
              left: 36 * scale,
              top: item.y * scale,
              fontSize: 7.5 * scale,
              color: "#666",
              fontWeight: 500,
              letterSpacing: 0.2,
              display: "flex",
              alignItems: "center",
              height: 16 * scale,
            }}
          >
            {item.label}
          </div>

          {}
          {item.labelRight && (
            <div
              style={{
                position: "absolute",
                right: 40 * scale,
                top: item.y * scale,
                fontSize: 7.5 * scale,
                color: "#666",
                fontWeight: 500,
                letterSpacing: 0.2,
                display: "flex",
                alignItems: "center",
                height: 16 * scale,
              }}
            >
              {item.labelRight}
            </div>
          )}

          {}
          {!item.label.startsWith("☐") && (
            <div
              style={{
                position: "absolute",
                left: 34 * scale,
                right: 34 * scale,
                top: (item.y + 28) * scale,
                borderBottom: "1px solid #e0e0e0",
              }}
            />
          )}
        </div>
      ))}

      {}
      {pageNumber === 1 && (
        <div
          style={{
            position: "absolute",
            right: 34 * scale,
            top: 288 * scale,
            fontSize: 7.5 * scale,
            color: "#666",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          AMOUNT
        </div>
      )}
    </div>
  );
}
