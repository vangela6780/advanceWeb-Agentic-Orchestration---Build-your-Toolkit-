import { Command, CLIContext, CommandResult, ServiceContainer } from '../domain/types';
import { BasePlugin } from '../application/pluginManager';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

/**
 * Image Generator Plugin - Uses OpenAI DALL-E to generate images
 * Saves generated images to an images folder
 */
export class ImageGeneratorPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');
    const configManager = container.get('configManager');

    logger.info('Initializing Image Generator Plugin');

    const apiKey = configManager.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in configuration');
    }

    // Register image generation command
    commandRegistry.register(new GenerateImageCommand(apiKey, logger));

    logger.info('Image Generator plugin initialized');
  }
}

/**
 * Generate Image Command - Creates images using DALL-E
 */
class GenerateImageCommand extends Command {
  readonly name = 'generate-image';
  readonly description = 'Generate an image using AI (DALL-E)';
  readonly usage = 'generate-image <prompt> [--size <1024x1024|1024x1792|1792x1024>] [--quality <standard|hd>] [--output <filename>]';

  private openai: OpenAI;
  private logger: any;

  constructor(apiKey: string, logger: any) {
    super();
    this.openai = new OpenAI({ apiKey });
    this.logger = logger;
  }

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (context.arguments.length < 1) {
      return { valid: false, errors: ['Image prompt required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      // Parse arguments
      const args = context.arguments;
      let prompt = '';
      let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
      let quality: 'standard' | 'hd' = 'standard';
      let outputFile = null;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--size' && i + 1 < args.length) {
          const sizeArg = args[i + 1];
          if (['1024x1024', '1024x1792', '1792x1024'].includes(sizeArg)) {
            size = sizeArg as any;
          }
          i++;
        } else if (args[i] === '--quality' && i + 1 < args.length) {
          const qualityArg = args[i + 1];
          if (['standard', 'hd'].includes(qualityArg)) {
            quality = qualityArg as any;
          }
          i++;
        } else if (args[i] === '--output' && i + 1 < args.length) {
          outputFile = args[i + 1];
          i++;
        } else {
          prompt += (prompt ? ' ' : '') + args[i];
        }
      }

      this.logger.info(`Generating image: ${prompt}`);
      this.logger.info(`Size: ${size}, Quality: ${quality}`);

      // Estimate cost
      const costEstimate = quality === 'hd' ? '$0.08-$0.12' : '$0.04-$0.06';
      this.logger.info(`Estimated cost: ${costEstimate}`);

      // Generate image using DALL-E 3
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        response_format: 'url',
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned');
      }
      
      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('No image URL returned');
      }

      // Create images directory
      const imagesDir = path.join(process.cwd(), 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = outputFile || `generated-${timestamp}.png`;
      const filePath = path.join(imagesDir, filename.endsWith('.png') ? filename : `${filename}.png`);

      // Download and save image
      await this.downloadImage(imageUrl, filePath);

      this.logger.info(`Image saved to: ${filePath}`);

      // Save metadata
      const metadataPath = filePath.replace('.png', '.json');
      const revisedPrompt = response.data[0].revised_prompt || prompt;
      const metadata = {
        prompt,
        size,
        quality,
        generatedAt: new Date().toISOString(),
        revisedPrompt,
        model: 'dall-e-3',
      };
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      return {
        success: true,
        message: `Image generated successfully! Saved to: ${filePath}`,
        data: { filePath, prompt, revisedPrompt, size, quality, costEstimate },
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };

    } catch (error: any) {
      this.logger.error(`Image generation failed: ${error.message}`);
      return {
        success: false,
        error: `Image generation failed: ${error.message}`,
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  private downloadImage(url: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlinkSync(filePath);
          reject(err);
        });
      }).on('error', reject);
    });
  }
}
