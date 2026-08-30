type SocialCardProps = {
  title: string;
  date?: string;
};

function titleSize(title: string): number {
  if (title.length > 100) return 46;
  if (title.length > 75) return 54;
  if (title.length > 55) return 62;
  if (title.length > 35) return 72;
  return 84;
}

export function SocialCard({ title, date }: SocialCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#090909",
        color: "#f5f2ea",
        border: "2px solid #292929",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            color: "#a3a3a3",
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}
        >
          AUGUSTL.COM
        </div>
      </div>

      <div
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "30px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1020,
            display: "flex",
            fontSize: titleSize(title),
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.045em",
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#a3a3a3",
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex" }}>August Lilleaas</div>
        <div style={{ display: "flex" }}>{date ?? "The CRUD blog"}</div>
      </div>
    </div>
  );
}
