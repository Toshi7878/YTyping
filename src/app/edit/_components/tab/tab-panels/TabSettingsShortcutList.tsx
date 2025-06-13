import { Card, CardContent } from "@/components/ui/card";
import EditorSettingModal from "./tab-settings-shortcutlist-child/Settings";
import ShortCutKeyList from "./tab-settings-shortcutlist-child/settings-child/ShortCutKeyList";

const TabSettings = () => {
  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        <div className="space-y-6">
          <EditorSettingModal />
          <ShortCutKeyList />
        </div>
      </CardContent>
    </Card>
  );
};

export default TabSettings;
