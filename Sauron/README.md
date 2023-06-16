# Sauron

## Usage 
    npm run build

## Map
    Config {
      alliance: {
        name: string | null;
        attack?: {
          default_waves?: number;
          after_land_ticks?: number;
          max_claims?: number;
        }
      };
      discord?: {
        owner: string | null,
        token: string | null;
        client_id: string | null;
        guild_id: string | null;
        commands: string[] | null;
      };
      telegram?: {
        owner: string | null,
        token: string | null;
        username: string | null;
        group_id: string | null;
        commands: string[] | null;
      };
      twilio?: {
        url?: string;
        sid: string | null;
        secret: string | null;
        number: string | null;
        ring_timeout?: number;
      };
      db?: {
        url?: string;
        name?: string;
        user?: string;
        pass?: string;
      },
      web: {
        env?: 'dev' | 'prod';
        port?: number;
        url: string | null;
        session: string | null;
        default_profile_pic?: string;
        default_theme: string | null;
        themes?: { [key: string]: { name: string; navbar: string }; }
      },
      access?: { [key: number]: string; },
      roles?: { [key: number]: string; },
      pa?: {
        links?: { [key: string]: string; },
        dumps?: { [key: string]: string; },
        tick?: { [key: string]: number; },
        numbers?: { [key: string]: number; },
        ships?: {
          min_uni_eta?: number;
          targets?: { [key: string]: string; },
          damagetypes?: { [key: string]: string; },
          targeteffs?: { [key: string]: number; },
          classes?: { [key: string]: string; },
        },
        roids?: { [key: string]: number; },
        bash?: { [key: string]: number; },
      }
    }
