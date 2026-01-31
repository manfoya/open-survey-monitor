import {
  DataType,
  Modalite,
  UIConfig,
  VariableDataType,
} from "@/features/variables/types";

export default function VariableConfigurationViewer({
  variable,
}: {
  variable: VariableDataType;
}) {
  switch (variable.data_type) {
    case DataType.NUMBER:
      return <NumberConfigView config={variable.ui_config || {}} />;
    case DataType.LIST:
      return <ListConfigView modalites={variable.modalites || []} />;
    case DataType.DATE:
      return <DateConfigView config={variable.ui_config || {}} />;
    case DataType.TEXT:
      return <TextConfigView config={variable.ui_config || {}} />;
    default:
      return (
        <p className="text-muted-foreground">Type de donnée non reconnu.</p>
      );
  }
}

function NumberConfigView({ config }: { config: UIConfig }) {
  const items = [
    { label: "Minimum", value: config.min },
    { label: "Maximum", value: config.max },
    { label: "Incrément (Step)", value: config.step },
    { label: "Unité", value: config.unit },
    { label: "Placeholder", value: config.placeholder },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div key={i} className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {item.label}
          </p>
          <p className="text-sm font-medium">
            {item.value !== undefined && item.value !== "" ? item.value : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function ListConfigView({
  modalites,
}: {
  modalites: Omit<Modalite, "id">[]; // DB Modalites might not have React ID
}) {
  if (!modalites || modalites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Aucune option définie.
      </p>
    );
  }

  const sortedModalites = [...modalites].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left w-16 font-medium text-muted-foreground">
              Ordre
            </th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
              Code
            </th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
              Libellé
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sortedModalites.map((mod, idx) => (
            <tr key={idx} className="hover:bg-muted/20">
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {mod.order}
              </td>
              <td className="px-4 py-2 font-mono">{mod.value}</td>
              <td className="px-4 py-2">{mod.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DateConfigView({ config }: { config: UIConfig }) {
  const items = [
    { label: "Date Minimum", value: config.minDate },
    { label: "Date Maximum", value: config.maxDate },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={i} className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {item.label}
          </p>
          <p className="text-sm font-medium">
            {item.value ? new Date(item.value).toLocaleDateString() : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function TextConfigView({ config }: { config: UIConfig }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Placeholder</p>
        <p className="text-sm">
          {config.placeholder || (
            <span className="text-muted-foreground">—</span>
          )}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Expression régulière (Regex)
        </p>
        {config.regex ? (
          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
            {config.regex}
          </code>
        ) : (
          <p className="text-sm font-medium text-muted-foreground">—</p>
        )}
      </div>
    </div>
  );
}
