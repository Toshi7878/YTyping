import { Card, CardContent } from "@/components/ui/card";
import EditorSettingModal from "./tab-settings-shortcutlist-child/Settings";
import ShortCutKeyList from "./tab-settings-shortcutlist-child/settings-child/ShortCutKeyList";

const TabSettings = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          <EditorSettingModal />
          <ShortCutKeyList />
        </div>
      </CardContent>
    </Card>
  );
};

export default TabSettings;
