export type TelemetryTimestamp = string | number;

export type RegistrationContext = {
  flow: 'onboarding' | 'manual' | 'import';
};

export type QrContext = {
  source: 'profile' | 'share' | 'preview';
};

export type ProfileContext = {
  section: 'public' | 'private' | 'print';
};

export type EmergencyContext = {
  action: 'open' | 'call' | 'share' | 'copied';
};

export type AdoptionContext = {
  section: 'list' | 'detail' | 'form';
};

export type FoundPetContext = {
  step: 'started' | 'reported' | 'shared';
};

export type TelemetryEvent =
  | {
      name: 'registration_started';
      timestamp: TelemetryTimestamp;
      context: RegistrationContext;
    }
  | {
      name: 'registration_completed';
      timestamp: TelemetryTimestamp;
      context: RegistrationContext & { success: boolean };
    }
  | {
      name: 'qr_generated';
      timestamp: TelemetryTimestamp;
      context: QrContext;
    }
  | {
      name: 'profile_viewed';
      timestamp: TelemetryTimestamp;
      context: ProfileContext;
    }
  | {
      name: 'emergency_action_started';
      timestamp: TelemetryTimestamp;
      context: EmergencyContext;
    }
  | {
      name: 'found_pet_flow_started';
      timestamp: TelemetryTimestamp;
      context: FoundPetContext;
    }
  | {
      name: 'adoption_request_started';
      timestamp: TelemetryTimestamp;
      context: AdoptionContext;
    };

export type TelemetryEventName = TelemetryEvent['name'];
