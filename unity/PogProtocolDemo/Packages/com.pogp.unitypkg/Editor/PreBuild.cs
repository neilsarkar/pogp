using System.Diagnostics;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using Debug = UnityEngine.Debug;

public class PreBuild : IPreprocessBuildWithReport
{
    public int callbackOrder => 0;

    public void OnPreprocessBuild(BuildReport report) {
        PromotePlugin();
    }

    public static void PromotePlugin() {
        // https://forum.unity.com/threads/execute-shell-script-from-unity-script-osx-tts.160069/
        ProcessStartInfo startInfo = new ProcessStartInfo("/bin/bash");
        startInfo.WorkingDirectory = System.IO.Directory.GetCurrentDirectory();
        startInfo.UseShellExecute = false;
        startInfo.RedirectStandardInput = true;
        startInfo.RedirectStandardOutput = true;

        Process process = new Process();
        process.StartInfo = startInfo;
        process.Start();

        process.StandardInput.WriteLine("cp Assets/Plugins/Editor/*.dylib Assets/Plugins/pogp_demo.dylib");
        process.StandardInput.WriteLine("exit");  // if no exit then WaitForExit will lockup your program
        process.StandardInput.Flush();

        string line = process.StandardOutput.ReadLine();
        process.WaitForExit();
    }
}
