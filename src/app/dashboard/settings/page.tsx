'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import AvatarPicker from '@/components/settings/avatar-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { ClientOnlyT } from '@/components/layout/app-sidebar';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import PetPicker from '@/components/settings/pet-picker';
import { useToast } from '@/hooks/use-toast';
import { getClientUser as getUser, updateClientUser as updateUser } from '@/lib/client-data';
import { User } from '@/lib/data-types';
import { Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontendParamsInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [petName, setPetName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedPet, setSelectedPet] = useState('');
  const [appLogo, setAppLogo] = useState('');
  const [frontendLogo, setFrontendLogo] = useState('');

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  const handleUserUpdate = async () => {
    // Check storage mode first
    const { getStorageStatus } = await import('@/lib/data-browser');
    const status = await getStorageStatus();

    let user: User | null = null;

    if (status === 'db' || status === 'kv') {
      const { getUser } = await import('@/lib/data-browser');
      user = await getUser();
    } else {
      const { getClientUser } = await import('@/lib/client-data');
      user = await getClientUser();
    }

    setCurrentUser(user);
    if (user) {
      setName(user.name);
      setPetName(user.petName);
      setSelectedAvatar(user.avatar);
      setSelectedPet(user.petStyle);
      setAppLogo(user.appLogo || '');
      setFrontendLogo(user.frontendLogo || '');
    }
  };

  useEffect(() => {
    setIsClient(true);
    const soundEnabled = localStorage.getItem('sound-effects-enabled') !== 'false';
    setIsSoundEnabled(soundEnabled);

    handleUserUpdate();

    window.addEventListener('userProfileUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleUserUpdate);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSoundToggle = (checked: boolean) => {
    setIsSoundEnabled(checked);
    localStorage.setItem('sound-effects-enabled', String(checked));
  };

  const handleSaveChanges = async () => {
    try {
      const { getStorageStatus } = await import('@/lib/data-browser');
      const status = await getStorageStatus();

      const newUserData = {
        name: name,
        petName: petName,
        avatar: selectedAvatar,
        petStyle: selectedPet,
        appLogo: appLogo,
        frontendLogo: frontendLogo,
      };

      if (status === 'db' || status === 'kv') {
        const { updateUser } = await import('@/lib/data-browser');
        await updateUser(newUserData);
      } else {
        const { updateClientUser } = await import('@/lib/client-data');
        await updateClientUser(newUserData);
      }

      toast({
        title: t('settings.profile.saveSuccessTitle'),
        description: t('settings.profile.saveSuccessDescription'),
      });
      // Trigger a manual refresh of user data everywhere
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));
    } catch (error) {
      console.error(error);
      toast({
        title: "保存失败 (Save Failed)",
        description: "数据库更新失败，请检查数据库连接或字段是否存在。 (Database update failed.)",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFrontendLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontendLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSyncData = async () => {
    try {
      toast({ title: "Syncing...", description: "Uploading data to the server." });

      const { getClientUser, getClientTasks, getClientAchievements, getClientRewards } = await import('@/lib/client-data');
      const [lUser, lTasks, lAchievements, lRewards] = await Promise.all([
        getClientUser(),
        getClientTasks(),
        getClientAchievements(),
        getClientRewards()
      ]);

      const { syncLocalDataToDb } = await import('@/lib/data-browser');
      const result = await syncLocalDataToDb(lUser, lTasks, lAchievements, lRewards);

      if (result.success) {
        toast({ title: "Sync Complete", description: "Your local data has been saved to the database." });
        // Force refresh to now fetch from DB?
        handleUserUpdate();
      } else {
        toast({ title: "Sync Failed", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unexpected error during sync.", variant: "destructive" });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!isClient || !currentUser) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 bg-background px-4">
          <div className="flex items-center gap-1 w-full">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold truncate"><ClientOnlyT tKey='settings.title' /></h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 space-y-8">
          <Skeleton className="w-full h-96 rounded-lg" />
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-full h-48 rounded-lg" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 bg-background px-4">
        <div className="flex items-center gap-1 w-full">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold truncate"><ClientOnlyT tKey='settings.title' /></h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle><ClientOnlyT tKey='settings.profile.title' /></CardTitle>
            <CardDescription><ClientOnlyT tKey='settings.profile.description' /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name"><ClientOnlyT tKey='settings.profile.name' /></Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label><ClientOnlyT tKey='settings.profile.avatar' /></Label>
              <AvatarPicker selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="petName"><ClientOnlyT tKey='settings.profile.petName' /></Label>
              <Input id="petName" value={petName} onChange={(e) => setPetName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label><ClientOnlyT tKey='settings.profile.choosePet' /></Label>
              <PetPicker
                selectedPet={selectedPet}
                onSelectPet={setSelectedPet}
                userLevel={currentUser.level}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><ClientOnlyT tKey='settings.personalization.title' /></CardTitle>
            <CardDescription><ClientOnlyT tKey='settings.personalization.description' /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode"><ClientOnlyT tKey='settings.personalization.darkMode' /></Label>
                <p className="text-sm text-muted-foreground"><ClientOnlyT tKey='settings.personalization.darkModeDescription' /></p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-effects"><ClientOnlyT tKey='settings.personalization.soundEffects' /></Label>
                <p className="text-sm text-muted-foreground"><ClientOnlyT tKey='settings.personalization.soundEffectsDescription' /></p>
              </div>
              <Switch
                id="sound-effects"
                checked={isSoundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><ClientOnlyT tKey='settings.language.title' /></CardTitle>
            <CardDescription><ClientOnlyT tKey='settings.language.description' /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language-select"><ClientOnlyT tKey='settings.language.displayLanguage' /></Label>
              <Select value={i18n.language} onValueChange={changeLanguage}>
                <SelectTrigger id="language-select" className="w-[280px]">
                  <SelectValue placeholder={t('settings.language.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文 (Chinese)</SelectItem>
                  <SelectItem value="en-zh">中英对照 (Bilingual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><ClientOnlyT tKey='settings.appearance.title' /></CardTitle>
            <CardDescription><ClientOnlyT tKey='settings.appearance.description' /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="appLogoUrl"><ClientOnlyT tKey='settings.profile.appLogo' /></Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg border bg-muted overflow-hidden shrink-0">
                    {appLogo ? (
                      <img src={appLogo} alt="Logo Preview" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Preview (200x200)</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground"><ClientOnlyT tKey='settings.profile.logoUrlPlaceholder' /></p>
                    <div className="flex gap-2">
                      <Input
                        id="appLogoUrl"
                        placeholder="https://..."
                        value={appLogo.startsWith('data:') ? '' : appLogo}
                        onChange={(e) => setAppLogo(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleUploadClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        <ClientOnlyT tKey='settings.profile.upload' />
                      </Button>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="frontendLogoUrl"><ClientOnlyT tKey='settings.appearance.frontendLogo' /></Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg border bg-muted overflow-hidden shrink-0">
                    {frontendLogo ? (
                      <img src={frontendLogo} alt="Frontend Logo Preview" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Preview (200x200)</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground"><ClientOnlyT tKey='settings.profile.logoUrlPlaceholder' /></p>
                    <div className="flex gap-2">
                      <Input
                        id="frontendLogoUrl"
                        placeholder="https://..."
                        value={frontendLogo.startsWith('data:') ? '' : frontendLogo}
                        onChange={(e) => setFrontendLogo(e.target.value)}
                      />
                      <Button variant="outline" onClick={() => frontendParamsInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        <ClientOnlyT tKey='settings.profile.upload' />
                      </Button>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={frontendParamsInputRef}
                  className="hidden"
                  onChange={handleFrontendLogoChange}
                  accept="image/*"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges}><ClientOnlyT tKey='settings.profile.save' /></Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><ClientOnlyT tKey='settings.sync.title' /></CardTitle>
            <CardDescription><ClientOnlyT tKey='settings.sync.description' /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium"><ClientOnlyT tKey='settings.sync.uploadLabel' /></p>
                <p className="text-sm text-muted-foreground">
                  <ClientOnlyT tKey='settings.sync.uploadInfo' />
                </p>
              </div>
              <Button onClick={handleSyncData} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                <ClientOnlyT tKey='settings.sync.uploadButton' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
