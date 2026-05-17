import { InfoBlock } from "@/components/ui/InfoBlock";

export function LocalStorageDisclaimer() {
  return (
    <InfoBlock tone="muted">
      Your work is saved in this browser only. Clearing browser data or
      switching devices will erase it. Nothing is sent to any server beyond the
      AI model that analyzes your text.
    </InfoBlock>
  );
}
