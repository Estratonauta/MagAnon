package com.maganon.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.maganon.app.plugins.MagSensorsPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(MagSensorsPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
