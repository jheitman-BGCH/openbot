# Fork downloads

This fork builds installers for Apple silicon Macs, Intel Macs, and Windows x64 PCs.
Users do not need Bun, Git, or the source code.

## Build status

Open [Fork desktop installers](https://github.com/jheitman-BGCH/openbot/actions/workflows/fork-desktop.yml).
Each successful run has three download artifacts:

| Device | Artifact | Installer |
| --- | --- | --- |
| Mac with an Apple M-series chip | `openbot-mac-apple-silicon` | `OpenBot-*-arm64.dmg` |
| Mac with an Intel processor | `openbot-mac-intel` | `OpenBot-*-x64.dmg` |
| Windows 10 or newer, x64 | `openbot-windows` | `OpenBot-*-x64.exe` |

GitHub requires a signed-in account to download workflow artifacts. Extract the artifact ZIP to
get the installer and `SHA256SUMS.txt`. These are build downloads for review. The public download
link will be [Fork releases](https://github.com/jheitman-BGCH/openbot/releases) after the first
release is approved and published.

## Install

On a Mac, open the DMG and drag OpenBot to Applications. Open OpenBot from Applications.
On Windows, open the EXE and follow the installer steps.

These builds are unsigned. macOS can block the first launch, and Windows can show an unknown
publisher warning. An Apple Developer account and Windows signing credentials are not required
to build or distribute these installers.

If macOS blocks an installer from this fork, first check that you downloaded it from the fork's
release page. After the blocked launch, open **System Settings > Privacy & Security**, find the
OpenBot message, and select **Open Anyway**. Confirm the launch if prompted. See
[Apple's instructions](https://support.apple.com/en-us/102445). A managed device can prevent this
exception; contact its administrator in that case. Do not disable system security.

The fork uses the OpenBot application name, install identity, and data folder. It can replace an
existing OpenBot installation. Quit OpenBot before you install this fork. Do not run both versions
with the same data folder. The installer does not create a database backup.

## Publish a public download

1. Run the [release upgrade safety audit](../.agents/skills/release-upgrade-safety/SKILL.md).
   Follow the applicable [release checks](RELEASING.md) for the affected desktop targets. This
   fork uses unsigned installers instead of the original project's signed release process. Do not run the
   original production release workflow: it also deploys services owned by the original project.
2. Build and check all three installers in GitHub Actions. Check installation and first launch on
   real devices. Create a release in this fork and attach the installers and checksums. Use release
   notes with one download link for each device type and the first-launch instructions above.
3. Share the release link with users. GitHub public release downloads do not need a GitHub account.

Signing is an optional improvement. It needs accounts owned by this fork: Apple Developer ID with
notarization, and Windows code signing. A signed fork configuration must use its own Apple team
identity and associated-domain entitlement. Do not use the original project's signing secrets.

`electron-builder.fork.yml` sets the packaged update feed to this fork. It does not publish files.
The workflow also sets `OPENBOT_RELEASE_REPOSITORY` at build time, so host release discovery uses
the same fork. The installed application keeps this build value.
The build workflow has read-only repository access and does not create tags, releases, or deploy
services. Automatic Mac updates are not supported by these unsigned builds. A signed release must
also publish and verify the update ZIP files and manifests before automatic updates are enabled.

Pushes that change the fork workflow or builder configuration on `fork/**` branches start a build.
The current feature branch also starts one. After this workflow is on the default branch, use
**Run workflow** to build another commit.
